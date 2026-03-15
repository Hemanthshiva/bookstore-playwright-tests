import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { RunEntry } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  runs: RunEntry[];
}

const labels = (runs: RunEntry[]) =>
  runs.map((r) => `Run ${r.runNumber ?? r.runId}`).reverse();

export function RunsCharts({ runs }: Props) {
  if (runs.length === 0) return null;

  const reversed = [...runs].reverse();

  const barData = {
    labels: labels(reversed),
    datasets: [
      {
        label: 'Passed',
        data: reversed.map((r) => r.stats?.passed ?? 0),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
      {
        label: 'Failed',
        data: reversed.map((r) => r.stats?.failed ?? 0),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Skipped',
        data: reversed.map((r) => r.stats?.skipped ?? 0),
        backgroundColor: 'rgba(156, 163, 175, 0.7)',
      },
    ],
  };


  const passRateData = {
    labels: labels(reversed),
    datasets: [
      {
        label: 'Pass Rate (%)',
        data: reversed.map((r) => {
          const total = r.stats?.total ?? 0;
          return total > 0 ? ((r.stats?.passed ?? 0) / total) * 100 : 0;
        }),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="charts">
      <div className="chart-box">
        <h3>Pass Rate Trend (%)</h3>
        <div className="chart-inner">
          <Line data={passRateData} options={{ ...options, scales: { y: { min: 0, max: 100 } } }} />
        </div>
      </div>
      <div className="chart-box">
        <h3>Pass / Fail / Skip per run</h3>
        <div className="chart-inner">
          <Bar data={barData} options={options} />
        </div>
      </div>
    </div>
  );
}
