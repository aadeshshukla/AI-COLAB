import {
  calculateCGPA,
  getBestWorstSemesters,
  getBestWorstSubjects,
  getTotalCredits,
  getTotalBacklogs,
} from '../utils/analytics';

export default function AnalyticsSummary({ semesters }) {
  const cgpa = calculateCGPA(semesters);
  const { best: bestSem, worst: worstSem } = getBestWorstSemesters(semesters);
  const { best: topSubject, worst: weakSubject } = getBestWorstSubjects(semesters);
  const totalCredits = getTotalCredits(semesters);
  const totalBacklogs = getTotalBacklogs(semesters);

  // Enhanced motivating message logic
  let motivation = '';
  if (totalBacklogs === 0) {
    motivation = 'Outstanding achievement! You have no backlogs. Your dedication and consistency are inspiring. Keep aiming higher!';
  } else if (totalBacklogs === 1) {
    motivation = 'Just one backlog – you are almost there! With a little extra effort and focus, you can clear it and reach your goals. Believe in yourself!';
  } else if (totalBacklogs <= 3) {
    motivation = 'A few backlogs are just minor hurdles. Your perseverance and positive attitude will help you overcome them. Every step forward counts!';
  } else if (totalBacklogs <= 6) {
    motivation = 'Backlogs may seem challenging, but remember: every great success story has obstacles. Stay determined, seek help when needed, and keep moving forward!';
  } else {
    motivation = 'No matter how many backlogs, your journey is unique and full of potential. Stay strong, keep learning, and never lose hope. Progress is always possible!';
  }

  const cards = [
    {
      label: 'CGPA',
      value: cgpa !== null ? cgpa.toFixed(2) : 'N/A',
      sub: cgpa !== null ? 'Credit-weighted' : 'Not calculable (backlog present)',
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
    {
      label: 'Total Backlogs',
      value: totalBacklogs,
      sub: totalBacklogs === 0 ? 'No backlogs' : `${totalBacklogs} subjects/semesters failed`,
      color: 'from-red-700 to-red-900',
      textSize: 'text-4xl',
    },
    {
      label: 'Motivation',
      value: '',
      sub: motivation,
      color: 'from-blue-500 to-blue-700',
      textSize: 'text-base',
    },
    {
      label: 'PATHFINDER-AI',
      value: (
        <a href="https://pathfinder-ai-mu.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline text-white text-lg font-bold">
          Visit App
        </a>
      ),
      sub: 'Your Personalized Learning Journey Starts Here',
      color: 'from-indigo-600 to-indigo-800',
      textSize: 'text-base',
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
