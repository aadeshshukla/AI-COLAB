export default function StudentInfo({ student }) {
  const fields = [
    { label: 'Name', value: student.name },
    { label: 'Roll Number', value: student.rollNumber },
    { label: 'College Code', value: student.collegeCode },
    { label: 'Father Name', value: student.fatherName },
    { label: 'College Name', value: student.collegeName },
    { label: 'Branch', value: student.branch },
  ]

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-slate-700 mb-6">
      <h2 className="text-xl font-semibold text-slate-100 mb-4">Student Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-slate-100 font-medium">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
