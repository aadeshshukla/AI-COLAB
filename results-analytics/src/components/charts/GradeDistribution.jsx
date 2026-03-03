import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getGradeDistribution } from '../../utils/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

const GRADE_COLORS = {
  O: '#f59e0b',
  'A+': '#22c55e',
  A: '#14b8a6',
  'B+': '#3b82f6',
  B: '#6366f1',
  C: '#f97316',
  F: '#ef4444',
};

export default function GradeDistribution({ semesters }) {
  const dist = getGradeDistribution(semesters);
  const entries = Object.entries(dist).filter(([, v]) => v > 0);
  const totalSubjects = entries.reduce((s, [, v]) => s + v, 0);

  const data = {
    labels: entries.map(([g]) => g),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([g]) => GRADE_COLORS[g] || '#6b7280'),
        borderColor: '#1f2937',
        borderWidth: 3,
      },
    ],
  };

  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
      const { ctx, chartArea: { top, left, width, height } } = chart;
      ctx.save();
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(totalSubjects, left + width / 2, top + height / 2 - 8);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('subjects', left + width / 2, top + height / 2 + 14);
      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { color: '#d1d5db', padding: 12, font: { size: 12 } } },
    },
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">🎓 Grade Distribution</h3>
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}
