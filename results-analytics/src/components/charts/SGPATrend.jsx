import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { calculateCGPA } from '../../utils/analytics';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SGPATrend({ semesters }) {
  const labels = semesters.map((s) => s.semesterName || s.semester || '');
  const sgpaValues = semesters.map((s) => {
    const value = parseFloat(s.sgpa || s.SGPA);
    return Number.isFinite(value) ? value : null;
  });
  const cgpa = calculateCGPA(semesters);

  const datasets = [
    {
      label: 'SGPA',
      data: sgpaValues,
      borderColor: '#60a5fa',
      backgroundColor: 'rgba(96,165,250,0.15)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#60a5fa',
      pointRadius: 5,
      spanGaps: false,
    },
  ];

  if (cgpa !== null) {
    datasets.push({
      label: `CGPA (${cgpa})`,
      data: Array(labels.length).fill(cgpa),
      borderColor: '#f59e0b',
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#d1d5db' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      y: {
        min: 0,
        max: 10,
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
    },
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">📈 SGPA Trend</h3>
      <Line data={data} options={options} />
    </div>
  );
}
