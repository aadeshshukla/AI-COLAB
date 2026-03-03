import axios from 'axios'

const BASE_URL = import.meta.env.DEV
  ? '/jntuhresults/api/getAcademicResult'
  : 'https://jntuhresults.dhethi.com/api/getAcademicResult'

function hasSubjectBacklog(subjects = []) {
  return subjects.some((subj) => (subj.grade || subj.grades || '').toUpperCase() === 'F')
}

function normalizeAcademicResult(payload) {
  if (!payload || typeof payload !== 'object') return null

  const details = payload.details || payload.student || payload
  const results = payload.results || {}
  const rawSemesters = Array.isArray(results.semesters)
    ? results.semesters
    : Array.isArray(payload.semesters)
      ? payload.semesters
      : []

  const semesters = rawSemesters.map((sem) => {
    const subjects = Array.isArray(sem.subjects)
      ? sem.subjects.map((subj) => ({
          ...subj,
          grade: subj.grade || subj.grades || '',
        }))
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
    rollNumber: details.rollNumber || details.rollNo || '',
    semesters,
    hasBacklog: hasOverallBacklog,
    cgpa: hasOverallBacklog ? null : results.CGPA || payload.cgpa || payload.CGPA || '',
    credits: results.credits || payload.credits || '',
    backlogs: results.backlogs ?? payload.backlogs ?? '',
  }
}

export async function fetchAcademicResult(rollNumber) {
  const response = await axios.get(BASE_URL, {
    params: { rollNumber },
  })
  return normalizeAcademicResult(response.data)
}
