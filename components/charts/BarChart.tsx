'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface Props {
  data: ChartData;
}

const BarChart: React.FC<Props> = ({ data }) => {
  return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

export default BarChart;
