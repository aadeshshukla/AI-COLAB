export default function StudentInfo({ student }) {
  if (!student) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-3">Student Information</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {Object.entries(student).map(([key, value]) => (
          <div key={key}>
            <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
            <span className="text-white font-medium">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
