import { useState } from 'react'

const HEADERS = ['Subject Code', 'Subject Name', 'Internal', 'External', 'Total', 'Grade', 'Credits']

export default function SemesterTable({ semester, subjects, sgpa }) {
  const [open, setOpen] = useState(true)
  const isSgpaAvailable = sgpa !== null && sgpa !== undefined && sgpa !== ''

  return (
    <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 mb-4 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-lg font-semibold text-slate-100">{semester}</span>
        <span className="text-slate-400 text-sm">{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/60">
                {HEADERS.map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj, idx) => (
                <tr key={idx} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{subj.subjectCode}</td>
                  <td className="px-4 py-3 text-slate-100">{subj.subjectName}</td>
                  <td className="px-4 py-3 text-slate-300 text-center">{subj.internalMarks}</td>
                  <td className="px-4 py-3 text-slate-300 text-center">{subj.externalMarks}</td>
                  <td className="px-4 py-3 text-slate-300 text-center">{subj.totalMarks}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${subj.grade === 'F' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {subj.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-center">{subj.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end px-6 py-3 border-t border-slate-700 bg-slate-700/20">
            <span className="text-slate-400 text-sm mr-2">SGPA:</span>
            <span className={`font-bold ${isSgpaAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isSgpaAvailable ? sgpa : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
