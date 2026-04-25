'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';

const metricConfig = {
  cpu: { label: 'CPU', color: 'bg-blue-500' },
  memory: { label: '内存', color: 'bg-green-500' },
  disk: { label: '磁盘', color: 'bg-yellow-500' },
};

interface ResourceGaugeProps {
  metric: 'cpu' | 'memory' | 'disk';
  value: number;
  threshold?: number;
}

export function ResourceGauge({ metric, value, threshold }: ResourceGaugeProps) {
  const config = metricConfig[metric];
  const isAlert = threshold !== undefined && value > threshold;

  return (
    <Card className={isAlert ? 'border-destructive' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{config.label}</span>
          <div className="flex items-center gap-2">
            {isAlert && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <span className="text-lg font-bold">{value.toFixed(1)}%</span>
          </div>
        </div>

        <Progress
          value={value}
          className="h-2"
          indicatorClassName={config.color}
        />

        {threshold !== undefined && (
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>阈值: {threshold}%</span>
            {isAlert ? (
              <span className="text-destructive font-medium">超出阈值</span>
            ) : (
              <span>正常</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
