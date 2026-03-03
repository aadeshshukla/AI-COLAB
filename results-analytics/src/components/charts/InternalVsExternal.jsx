import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { getInternalExternalData } from '../../utils/analytics';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function InternalVsExternal({ semesters }) {
  const rawData = getInternalExternalData(semesters);

  if (rawData.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">🔵 Internal vs External</h3>
        <p className="text-gray-400 text-sm">No data available.</p>
      </div>
    );
  }

  const maxInternal = Math.max(...rawData.map((d) => d.internal), 30);
  const maxExternal = Math.max(...rawData.map((d) => d.external), 75);

  const data = {
    datasets: [
      {
        label: 'Subjects',
        data: rawData.map((d) => ({ x: d.internal, y: d.external, name: d.subjectName })),
        backgroundColor: 'rgba(99,102,241,0.7)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Balanced line',
        data: [
          { x: 0, y: 0 },
          { x: maxInternal, y: maxExternal },
        ],
        type: 'line',
        borderColor: 'rgba(245,158,11,0.5)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#d1d5db' } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pt = ctx.raw;
            return pt.name
              ? `${pt.name}: Internal=${pt.x}, External=${pt.y}`
              : `Internal=${pt.x}, External=${pt.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
        title: { display: true, text: 'Internal Marks', color: '#9ca3af' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
        title: { display: true, text: 'External Marks', color: '#9ca3af' },
      },
    },
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">🔵 Internal vs External</h3>
      <Scatter data={data} options={options} />
    </div>
  );
}
