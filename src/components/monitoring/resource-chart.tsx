'use client';

import { useMemo } from 'react';
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
import { Line } from 'react-chartjs-2';
import type { ResourceUsage } from '@/types/monitoring';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const metricConfig = {
  cpu: { label: 'CPU', color: 'rgb(59, 130, 246)', bgColor: 'rgba(59, 130, 246, 0.1)' },
  memory: { label: '内存', color: 'rgb(16, 185, 129)', bgColor: 'rgba(16, 185, 129, 0.1)' },
  disk: { label: '磁盘', color: 'rgb(245, 158, 11)', bgColor: 'rgba(245, 158, 11, 0.1)' },
};

interface ResourceChartProps {
  data: ResourceUsage[];
  metric: 'cpu' | 'memory' | 'disk';
  thresholds?: number[];
}

export function ResourceChart({ data, metric, thresholds = [] }: ResourceChartProps) {
  const config = metricConfig[metric];

  const chartData = useMemo(() => {
    const labels = data.map((d) => {
      const date = new Date(d.timestamp);
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    });

    const values = data.map((d) => d[metric]);

    return {
      labels,
      datasets: [
        {
          label: config.label,
          data: values,
          borderColor: config.color,
          backgroundColor: config.bgColor,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        ...thresholds.map((threshold, idx) => ({
          label: `阈值 ${idx + 1}`,
          data: Array(labels.length).fill(threshold),
          borderColor: 'rgb(239, 68, 68)',
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        })),
      ],
    };
  }, [data, metric, config, thresholds]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: thresholds.length > 0,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="h-[200px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
