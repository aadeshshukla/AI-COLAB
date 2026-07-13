// Parsing functions
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

    console.log('Extracted student info:', studentInfo)
    console.log('Total lines:', lines.length)
    console.log('Line sample:', lines.slice(30, 35))

    // Parse semesters
    const semesters = []
    let i = 0
    
    while (i < lines.length) {
      const line = lines[i]
      
      // Look for semester marker (1-1, 1-2, 2-1, etc.)
      if (/^\d+-\d+$/.test(line)) {
        console.log(`\nFound semester: ${line} at line ${i}`)
        const semesterName = line
        const [year, sem] = line.split('-').map(Number)
        const semester = (year - 1) * 2 + sem
        
        // Find SGPA
        let sgpa = ''
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          if (lines[j].toUpperCase() === 'SGPA' && j + 1 < lines.length) {
            sgpa = lines[j + 1]
            console.log(`  SGPA: ${sgpa}`)
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
            console.log(`  Parsing subject line: ${currentLine.substring(0, 80)}...`)
            
            // Parse this line - it contains all subject info
            const parts = currentLine.split(/\s+/)
            console.log(`    Parts: ${parts.join('|')}`)
            
            // Extract code (first part)
            let codeIdx = 0
            const code = parts[codeIdx]
            
            // Find where subject name ends (look for marks starting with numbers)
            let nameEndIdx = codeIdx + 1
            while (nameEndIdx < parts.length && !isNumericOrGradeStrict(parts[nameEndIdx])) {
              nameEndIdx++
            }
            
            const name = parts.slice(codeIdx + 1, nameEndIdx).join(' ')
            
            // Remaining parts are: internal, external, total, grade, credits
            const marks = parts.slice(nameEndIdx)
            console.log(`    Code: ${code}, Name: ${name}, Marks: ${marks.join('|')}`)
            
            if (marks.length >= 5) {
              subjects.push({
                code,
                name: name || 'Unknown',
                internal: marks[0] || '',
                external: marks[1] || '',
                total: marks[2] || '',
                grade: marks[3] || '',
                credits: marks[4] || '',
              })
            }
          }
          
          i++
        }
        
        console.log(`  Total subjects in semester: ${subjects.length}`)
        
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

    console.log(`\nTotal semesters parsed: ${semesters.length}`)

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
    console.error('Parse error:', error.message, error.stack)
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

// Sample output from Playwright test - EXACT format
const sampleText = `Get the App
Toggle theme
Home
Results
Calendars
Syllabus
Jobs & carrers
Notifications
Imp Questions
Channels
Connect via MCP
Help center
ACADEMIC RESULTS

SEMESTER-WISE PERFORMANCE OVERVIEW

STUDENT NAME

AADESH SHUKLA

ROLL NUMBER

237W1A0501

COLLEGE CODE

7W

FATHER'S NAME

RAM MOORAT SHUKLA

COLLEGE NAME

St. Mary's Integrated Campus Hydedrabad

BRANCH

Computer Science & Engineering

1-1
SGPA
7.65
CODE    SUBJECT NAME    INT.    EXT.    TOTAL   GRADE   CR.
18117   PROGRAMMING FOR PROBLEM SOLVING LABORATORY      40      59      99     O1
181AB   BASIC ELECTRICAL ENGINEERING    34      29      63      B+      2
181AG   COMPUTER AIDED ENGINEERING GRAPHICS     33      36      69      B+     3
181AJ   ENGINEERING CHEMISTRY   38      44      82      A+      4
18107   ELEMENTS OF COMPUTER SCIENCE & ENGINEERING      45      —       45     O1
181AN   MATRICES AND CALCULUS   33      24      57      B       4
18102   BASIC ELECTRICAL ENGINEERING LABORATORY 40      58      98      O      1
181AP   PROGRAMMING FOR PROBLEM SOLVING 32      21      53      B       3
18113   ENGINEERING CHEMISTRY LABORATORY        39      58      97      O      1
1-2
SGPA
7.92
CODE    SUBJECT NAME    INT.    EXT.    TOTAL   GRADE   CR.
182AR   ORDINARY DIFFERENTIAL EQUATIONS AND VECTOR CALCULUS     30      24     54       B       4`

const result = parseAcademicResult(sampleText, '237W1A0501')
console.log('\n=== FINAL RESULT ===')
console.log(JSON.stringify(result, null, 2))

