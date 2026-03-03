/**
 * Calculate CGPA using credit-weighted cumulative GPA across all semesters.
 */
export function calculateCGPA(semesters) {
  if (!semesters || semesters.length === 0) return 0;
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  semesters.forEach((sem) => {
    const subjects = sem.subjects || [];
    subjects.forEach((sub) => {
      const credits = parseFloat(sub.credits) || 0;
      const gradePoints = gradeToPoints(sub.grade);
      totalWeightedPoints += gradePoints * credits;
      totalCredits += credits;
    });
  });
  if (totalCredits === 0) return 0;
  return parseFloat((totalWeightedPoints / totalCredits).toFixed(2));
}

function gradeToPoints(grade) {
  const map = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 };
  return map[grade] !== undefined ? map[grade] : 0;
}

/**
 * Count each grade across all semesters.
 */
export function getGradeDistribution(semesters) {
  const dist = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 };
  if (!semesters) return dist;
  semesters.forEach((sem) => {
    (sem.subjects || []).forEach((sub) => {
      if (dist[sub.grade] !== undefined) dist[sub.grade]++;
      else dist[sub.grade] = 1;
    });
  });
  return dist;
}

/**
 * Returns { best, worst } subjects by total marks.
 */
export function getBestWorstSubjects(semesters) {
  if (!semesters) return { best: null, worst: null };
  const all = [];
  semesters.forEach((sem) => {
    (sem.subjects || []).forEach((sub) => {
      all.push({ ...sub, semesterName: sem.semesterName || sem.semester });
    });
  });
  if (all.length === 0) return { best: null, worst: null };
  const passed = all.filter((s) => s.grade !== 'F');
  const sorted = [...all].sort(
    (a, b) => parseFloat(b.total || b.totalMarks || 0) - parseFloat(a.total || a.totalMarks || 0)
  );
  const best = sorted[0] || null;
  const worst = passed.length > 0
    ? passed.sort((a, b) => parseFloat(a.total || a.totalMarks || 0) - parseFloat(b.total || b.totalMarks || 0))[0]
    : sorted[sorted.length - 1];
  return { best, worst };
}

/**
 * Returns { best, worst } semesters by SGPA.
 */
export function getBestWorstSemesters(semesters) {
  if (!semesters || semesters.length === 0) return { best: null, worst: null };
  const sorted = [...semesters].sort(
    (a, b) => parseFloat(b.sgpa || b.SGPA || 0) - parseFloat(a.sgpa || a.SGPA || 0)
  );
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
}

/**
 * Returns array of { semesterName, avgTotal } for each semester.
 */
export function getSemesterAverages(semesters) {
  if (!semesters) return [];
  return semesters.map((sem) => {
    const subjects = sem.subjects || [];
    const avg =
      subjects.length > 0
        ? subjects.reduce((sum, s) => sum + parseFloat(s.total || s.totalMarks || 0), 0) /
          subjects.length
        : 0;
    const totalCredits = subjects.reduce((sum, s) => sum + parseFloat(s.credits || 0), 0);
    return {
      semesterName: sem.semesterName || sem.semester || '',
      avgTotal: parseFloat(avg.toFixed(2)),
      totalCredits,
    };
  });
}

/**
 * Returns array of { subjectName, internal, external } for scatter plot.
 */
export function getInternalExternalData(semesters) {
  if (!semesters) return [];
  const data = [];
  semesters.forEach((sem) => {
    (sem.subjects || []).forEach((sub) => {
      data.push({
        subjectName: sub.subjectName || sub.name || sub.subjectCode || '',
        internal: parseFloat(sub.internal || sub.internalMarks || 0),
        external: parseFloat(sub.external || sub.externalMarks || 0),
      });
    });
  });
  return data;
}

/**
 * Total credits earned (excluding F grades).
 */
export function getTotalCredits(semesters) {
  if (!semesters) return 0;
  let total = 0;
  semesters.forEach((sem) => {
    (sem.subjects || []).forEach((sub) => {
      if (sub.grade !== 'F') {
        total += parseFloat(sub.credits || 0);
      }
    });
  });
  return total;
}
