import axios from 'axios'

const BASE_URL = import.meta.env.VITE_RESULTS_API_URL || '/api/getAcademicResult'

function normalizeSubject(subj = {}) {
  const grade = subj.grade || subj.grades || ''

  return {
    ...subj,
    subjectCode: subj.subjectCode || subj.code || '',
    subjectName: subj.subjectName || subj.name || '',
    internalMarks: subj.internalMarks || subj.internal || '',
    externalMarks: subj.externalMarks || subj.external || '',
    totalMarks: subj.totalMarks || subj.total || '',
    code: subj.code || subj.subjectCode || '',
    name: subj.name || subj.subjectName || '',
    internal: subj.internal || subj.internalMarks || '',
    external: subj.external || subj.externalMarks || '',
    total: subj.total || subj.totalMarks || '',
    grade,
    credits: subj.credits || subj.credit || '',
  }
}

function hasSubjectBacklog(subjects = []) {
  return subjects.some((subj) => (subj.grade || '').toUpperCase() === 'F')
}

function normalizeAcademicResult(payload) {
  if (!payload || typeof payload !== 'object') return null

  // Handle different response structures from various APIs
  const details = payload.details || payload.student || payload
  
  // Try multiple ways to get semester data
  let rawSemesters = []
  if (Array.isArray(payload.semesters)) {
    rawSemesters = payload.semesters
  } else if (payload.results && Array.isArray(payload.results.semesters)) {
    rawSemesters = payload.results.semesters
  } else if (Array.isArray(payload.data)) {
    rawSemesters = payload.data
  }

  // If no semesters found, it's likely a "no results" response
  if (!rawSemesters || rawSemesters.length === 0) {
    return null
  }

  const results = payload.results || {}
  
  const semesters = rawSemesters.map((sem) => {
    const subjects = Array.isArray(sem.subjects)
      ? sem.subjects.map(normalizeSubject)
      : []

    const subjectBacklog = hasSubjectBacklog(subjects)
    const semesterBacklogs = Number(sem.backlogs || 0)
    const failed = Boolean(sem.failed)
    const isCalculable = !subjectBacklog && !failed && semesterBacklogs === 0

    return {
      ...sem,
      semester: sem.semester || sem.semesterName || '',
      subjects,
      hasBacklog: !isCalculable,
      sgpa: isCalculable ? sem.sgpa || sem.SGPA || sem.semesterSGPA || '' : null,
    }
  })

  const hasOverallBacklog =
    Number(results.backlogs ?? payload.backlogs ?? 0) > 0 ||
    semesters.some((sem) => sem.hasBacklog)

  return {
    ...details,
    rollNumber: details.rollNumber || details.rollNo || details.htno || '',
    semesters,
    hasBacklog: hasOverallBacklog,
    cgpa: hasOverallBacklog ? null : results.CGPA || payload.cgpa || payload.CGPA || '',
    credits: results.credits || payload.credits || '',
    backlogs: results.backlogs ?? payload.backlogs ?? '',
  }
}

export async function fetchAcademicResult(rollNumber) {
  try {
    const response = await axios.get(BASE_URL, {
      params: { rollNumber },
    })
    return normalizeAcademicResult(response.data)
  } catch (error) {
    throw error
  }
}
