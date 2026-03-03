import {
  calculateCGPA,
  getBestWorstSemesters,
  getBestWorstSubjects,
  getTotalCredits,
} from '../utils/analytics';

export default function AnalyticsSummary({ semesters }) {
  const cgpa = calculateCGPA(semesters);
  const { best: bestSem, worst: worstSem } = getBestWorstSemesters(semesters);
  const { best: topSubject, worst: weakSubject } = getBestWorstSubjects(semesters);
  const totalCredits = getTotalCredits(semesters);

  const cards = [
    {
      label: 'CGPA',
      value: cgpa.toFixed(2),
      sub: 'Credit-weighted',
      color: 'from-green-600 to-green-800',
      textSize: 'text-5xl',
    },
    {
      label: 'Best Semester',
      value: bestSem ? (bestSem.semesterName || bestSem.semester || '—') : '—',
      sub: bestSem ? `SGPA: ${bestSem.sgpa || bestSem.SGPA || 'N/A'}` : '',
      color: 'from-teal-600 to-teal-800',
      textSize: 'text-3xl',
    },
    {
      label: 'Worst Semester',
      value: worstSem ? (worstSem.semesterName || worstSem.semester || '—') : '—',
      sub: worstSem ? `SGPA: ${worstSem.sgpa || worstSem.SGPA || 'N/A'}` : '',
      color: 'from-orange-600 to-orange-800',
      textSize: 'text-3xl',
    },
    {
      label: 'Top Subject',
      value: topSubject ? (topSubject.subjectName || topSubject.name || '—') : '—',
      sub: topSubject ? `Total: ${topSubject.total || topSubject.totalMarks || 'N/A'}` : '',
      color: 'from-blue-600 to-blue-800',
      textSize: 'text-lg',
    },
    {
      label: 'Weakest Subject',
      value: weakSubject ? (weakSubject.subjectName || weakSubject.name || '—') : '—',
      sub: weakSubject ? `Total: ${weakSubject.total || weakSubject.totalMarks || 'N/A'}` : '',
      color: 'from-red-600 to-red-800',
      textSize: 'text-lg',
    },
    {
      label: 'Total Credits Earned',
      value: totalCredits,
      sub: 'Passed subjects',
      color: 'from-purple-600 to-purple-800',
      textSize: 'text-4xl',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white shadow-lg`}
        >
          <p className="text-sm text-white/70 mb-1 font-medium uppercase tracking-wide">{card.label}</p>
          <p className={`${card.textSize} font-bold leading-tight truncate`}>{card.value}</p>
          {card.sub && <p className="text-xs text-white/60 mt-1">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
