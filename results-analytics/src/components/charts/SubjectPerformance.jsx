import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SubjectPerformance({ semesters }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const sem = semesters[selectedIdx] || semesters[0];
  const subjects = sem ? (sem.subjects || []) : [];
  const labels = subjects.map(
    (s) => s.subjectCode || s.code || (s.subjectName || s.name || '').substring(0, 12)
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Internal',
        data: subjects.map((s) => parseFloat(s.internal || s.internalMarks || 0)),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
      {
        label: 'External',
        data: subjects.map((s) => parseFloat(s.external || s.externalMarks || 0)),
        backgroundColor: 'rgba(139,92,246,0.7)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#d1d5db' } },
    },
    scales: {
      x: { ticks: { color: '#9ca3af', maxRotation: 45 }, grid: { color: '#374151' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    },
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h3 className="text-white font-semibold">📊 Subject Performance</h3>
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
        >
          {semesters.map((s, i) => (
            <option key={i} value={i}>
              Sem {s.semesterName || s.semester || i + 1}
            </option>
          ))}
        </select>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
}
