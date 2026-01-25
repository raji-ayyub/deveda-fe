'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData } from '@/lib/types';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Props {
  data: ChartData;
}

const PieChart: React.FC<Props> = ({ data }) => {
  return <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

export default PieChart;
