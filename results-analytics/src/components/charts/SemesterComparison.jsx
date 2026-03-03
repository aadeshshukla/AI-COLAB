import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getSemesterAverages } from '../../utils/analytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function SemesterComparison({ semesters }) {
  const averages = getSemesterAverages(semesters);
  const labels = averages.map((a) => a.semesterName);

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Avg Marks',
        data: averages.map((a) => a.avgTotal),
        backgroundColor: 'rgba(34,197,94,0.6)',
        borderColor: '#22c55e',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Total Credits',
        data: averages.map((a) => a.totalCredits),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.1)',
        pointBackgroundColor: '#f59e0b',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { color: '#d1d5db' } } },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      y: {
        type: 'linear',
        position: 'left',
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
        title: { display: true, text: 'Avg Marks', color: '#9ca3af' },
      },
      y1: {
        type: 'linear',
        position: 'right',
        ticks: { color: '#f59e0b' },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Credits', color: '#f59e0b' },
      },
    },
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">📅 Semester Comparison</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
