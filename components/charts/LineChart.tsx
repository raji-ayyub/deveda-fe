'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Props {
  data: ChartData;
}

const LineChart: React.FC<Props> = ({ data }) => {
  return <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

export default LineChart;
