export default function SemesterTable({ semester }) {
  const subjects = semester.subjects || [];
  const sgpa = semester.sgpa || semester.SGPA || 'N/A';
  const semName = semester.semesterName || semester.semester || '';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">Semester {semName}</h3>
        <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
          SGPA: {sgpa}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="pb-2 pr-4">Code</th>
              <th className="pb-2 pr-4">Subject</th>
              <th className="pb-2 pr-4">Internal</th>
              <th className="pb-2 pr-4">External</th>
              <th className="pb-2 pr-4">Total</th>
              <th className="pb-2 pr-4">Grade</th>
              <th className="pb-2">Credits</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, idx) => (
              <tr key={idx} className="border-b border-gray-700/50 text-gray-300 hover:bg-gray-700/30">
                <td className="py-2 pr-4 font-mono text-xs">{sub.subjectCode || sub.code || ''}</td>
                <td className="py-2 pr-4">{sub.subjectName || sub.name || ''}</td>
                <td className="py-2 pr-4">{sub.internal || sub.internalMarks || '-'}</td>
                <td className="py-2 pr-4">{sub.external || sub.externalMarks || '-'}</td>
                <td className="py-2 pr-4 font-medium text-white">{sub.total || sub.totalMarks || '-'}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${gradeColor(sub.grade)}`}>
                    {sub.grade || '-'}
                  </span>
                </td>
                <td className="py-2">{sub.credits || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function gradeColor(grade) {
  const map = {
    O: 'bg-yellow-500/20 text-yellow-400',
    'A+': 'bg-green-500/20 text-green-400',
    A: 'bg-teal-500/20 text-teal-400',
    'B+': 'bg-blue-500/20 text-blue-400',
    B: 'bg-indigo-500/20 text-indigo-400',
    C: 'bg-orange-500/20 text-orange-400',
    F: 'bg-red-500/20 text-red-400',
  };
  return map[grade] || 'bg-gray-500/20 text-gray-400';
}
