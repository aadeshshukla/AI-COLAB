import serverlessChromium from '@sparticuz/chromium'
import { chromium as playwrightChromium } from 'playwright-core'

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

  let browser
  try {
    browser = await launchBrowser()

    const page = await browser.newPage()

    // Navigate to the page
    const url = `https://jntuhconnect.dhethi.com/academicresult/result?htno=${encodeURIComponent(studentNumber)}`
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 40000 
    })

    // Wait for student data
    try {
      await page.waitForFunction(
        () => {
          const text = document.body.innerText
          return text.includes('AADESH') || text.match(/\d{3}[A-Z]\d[A-Z]\d{4}/)
        },
        { timeout: 10000 }
      )
    } catch (e) {
      // Continue anyway
    }

    // Get the rendered content
    const text = await page.evaluate(() => document.body.innerText)

    // Close browser
    await page.close()
    await browser.close()
    browser = null

    // Parse the rendered text
    const data = parseAcademicResult(text, studentNumber)
    
    console.log('Parsed data:', JSON.stringify(data, null, 2).substring(0, 500))

    if (!data || !data.semesters || data.semesters.length === 0) {
      console.log('No data or semesters found')
      return res.status(404).json({ message: 'No results found for this roll number' })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('API Error:', error.message)
    return res.status(502).json({ message: 'Unable to fetch upstream results API' })
  } finally {
    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        // Ignore close errors
      }
    }
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

async function launchBrowser() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return playwrightChromium.launch({
      args: serverlessChromium.args,
      executablePath: await serverlessChromium.executablePath(),
      headless: true,
    })
  }

  return playwrightChromium.launch({
    headless: true,
  })
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
