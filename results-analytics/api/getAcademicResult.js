const UPSTREAM_RESULTS_API_URL = process.env.RESULTS_API_URL || 'https://jntuhresults.dhethi.com/api/getAcademicResult'
// Public key used by the JNTUH Connect browser UI. An environment value can
// override this when the provider rotates it.
const UPSTREAM_RESULTS_API_KEY = process.env.RESULTS_API_KEY || 'kanipinchinda'

function buildUpstreamHeaders() {
  return {
    accept: 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'X-Api-Key': UPSTREAM_RESULTS_API_KEY,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { rollNumber, htno } = req.query || {}
  const studentNumber = rollNumber || htno

  if (!studentNumber) {
    return res.status(400).json({ message: 'rollNumber or htno is required' })
  }

  try {
    const upstreamResult = await fetchUpstreamResults(studentNumber)
    return res.status(upstreamResult.status).json(upstreamResult.payload)
  } catch (error) {
    console.error('Results API request failed:', error.message)
    return res.status(502).json({
      message: 'Unable to reach the results service. Please try again shortly.',
    })
  }
}

async function fetchUpstreamResults(studentNumber) {
  try {
    const upstreamUrl = new URL(UPSTREAM_RESULTS_API_URL)
    upstreamUrl.searchParams.set('rollNumber', studentNumber)

    const response = await fetch(upstreamUrl.toString(), {
      headers: buildUpstreamHeaders(),
      signal: AbortSignal.timeout(12000),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        status: response.status,
        payload: {
          message: payload.message || payload.detail || 'The results service could not complete this request.',
        },
      }
    }

    return { status: 200, payload }
  } catch (error) {
    throw new Error(`Upstream request failed: ${error.message}`)
  }
}

function parseAcademicResult(text, studentNumber) {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

    // Extract student info
    const studentInfo = {
      name: extractValue(lines, 'STUDENT NAME'),
      rollNumber: extractValue(lines, 'ROLL NUMBER') || studentNumber,
      collegeName: extractValue(lines, 'COLLEGE NAME'),
      branch: extractValue(lines, 'BRANCH'),
      fatherName: extractValue(lines, 'FATHER\'S NAME'),
      collegeCode: extractValue(lines, 'COLLEGE CODE'),
      cgpa: extractValue(lines, 'CGPA'),
      backlogs: extractValue(lines, 'BACKLOGS'),
    }

    // Parse semesters
    const semesters = []
    let i = 0
    
    while (i < lines.length) {
      const line = lines[i]
      
      // Look for semester marker (1-1, 1-2, 2-1, etc.)
      if (/^\d+-\d+$/.test(line)) {
        const semesterName = line
        const [year, sem] = line.split('-').map(Number)
        const semester = (year - 1) * 2 + sem
        
        // Find SGPA
        let sgpa = ''
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          if (lines[j].toUpperCase() === 'SGPA' && j + 1 < lines.length) {
            sgpa = lines[j + 1]
            break
          }
        }
        
        // Parse subjects for this semester
        const subjects = []
        i++
        
        // Skip until we find "CODE" header
        while (i < lines.length && !lines[i].includes('CODE')) {
          i++
        }
        
        // Now parse subject lines
        i++ // Skip the header line
        
        while (i < lines.length) {
          const currentLine = lines[i]
          
          // Check if this is a new semester
          if (/^\d+-\d+$/.test(currentLine)) {
            i--
            break
          }
          
          // Check if this is a subject line (starts with code like 18117 or 181AB)
          if (/^[0-9][0-9A-Z]{3,6}\s+/.test(currentLine)) {
            // Parse this line - it contains all subject info
            const parts = currentLine.split(/\s+/)
            
            // Extract code (first part)
            const code = parts[0]
            
            // Find where subject name ends (look for marks starting with numbers)
            let nameEndIdx = 1
            while (nameEndIdx < parts.length && !isNumericOrGradeStrict(parts[nameEndIdx])) {
              nameEndIdx++
            }
            
            const name = parts.slice(1, nameEndIdx).join(' ')
            
            // Remaining parts are: internal, external, total, grade, credits
            const marks = parts.slice(nameEndIdx)
            
            // Handle case where grade and credits are concatenated (e.g., "O1" instead of "O", "1")
            if (marks.length === 4 && /^[A-FO]\d+$/.test(marks[3])) {
              const gradeCredits = marks[3]
              marks[3] = gradeCredits[0] // grade
              marks.push(gradeCredits.substring(1)) // credits
            }
            
            if (marks.length >= 5) {
              const subject = {
                subjectCode: code,
                subjectName: name || 'Unknown',
                internalMarks: marks[0] || '',
                externalMarks: marks[1] || '',
                totalMarks: marks[2] || '',
                grade: marks[3] || '',
                credits: marks[4] || '',
              }

              subjects.push({
                ...subject,
                code: subject.subjectCode,
                name: subject.subjectName,
                internal: subject.internalMarks,
                external: subject.externalMarks,
                total: subject.totalMarks,
              })
            }
          }
          
          i++
        }
        
        if (subjects.length > 0) {
          semesters.push({
            semester,
            semesterName: `Semester ${semesterName}`,
            sgpa,
            SGPA: sgpa,
            subjects,
          })
        }
      } else {
        i++
      }
    }

    if (semesters.length === 0) {
      return null
    }

    return {
      name: studentInfo.name,
      rollNumber: studentInfo.rollNumber,
      rollNo: studentInfo.rollNumber,
      htno: studentNumber,
      collegeName: studentInfo.collegeName,
      branch: studentInfo.branch,
      fatherName: studentInfo.fatherName,
      collegeCode: studentInfo.collegeCode,
      cgpa: studentInfo.cgpa && studentInfo.cgpa !== '—' ? studentInfo.cgpa : '',
      backlogs: studentInfo.backlogs && studentInfo.backlogs !== '—' ? parseInt(studentInfo.backlogs) || 0 : 0,
      semesters,
    }
  } catch (error) {
    console.error('Parse error:', error.message)
    return null
  }
}

function extractValue(lines, fieldName) {
  const upper = fieldName.toUpperCase()
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].toUpperCase() === upper) {
      return lines[i + 1]
    }
  }
  return ''
}

function isNumericOrGrade(str) {
  if (!str) return false
  // Check if it's a number
  if (!isNaN(parseInt(str))) return true
  // Check if it's a grade
  if (/^[A-FO]\+?$|^--?$|^—$/.test(str)) return true
  return false
}

function isNumericOrGradeStrict(str) {
  if (!str) return false
  // Must be all numeric or a valid grade
  if (/^\d+$/.test(str)) return true
  if (/^[A-FO][\+]?$|^--?$|^—$/.test(str)) return true
  return false
}
