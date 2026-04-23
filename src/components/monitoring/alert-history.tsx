'use client';

import { useMonitoringStore } from '@/store/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, Check } from 'lucide-react';
import type { Alert } from '@/types/monitoring';

const metricLabels = {
  cpu: 'CPU',
  memory: '内存',
  disk: '磁盘',
};

function formatAlertTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface AlertHistoryProps {
  maxItems?: number;
}

export function AlertHistory({ maxItems = 50 }: AlertHistoryProps) {
  const { alerts, acknowledgeAlert } = useMonitoringStore();

  const displayedAlerts = alerts.slice(0, maxItems);
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            告警历史
          </div>
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive">{unacknowledgedCount} 未确认</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              暂无告警记录
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: (id: string) => void }) {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${
        alert.acknowledged ? 'bg-muted/30 opacity-60' : 'border-destructive/50 bg-destructive/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-4 w-4 ${alert.acknowledged ? 'text-muted-foreground' : 'text-destructive'}`} />
        <div>
          <div className="font-medium flex items-center gap-2">
            {alert.agentName}
            {!alert.acknowledged && <span className="text-destructive text-sm">新</span>}
          </div>
          <div className="text-sm text-muted-foreground">
            {metricLabels[alert.metric]}: {alert.value.toFixed(1)}% (阈值: {alert.threshold}%)
          </div>
          <div className="text-xs text-muted-foreground">{formatAlertTime(alert.triggeredAt)}</div>
        </div>
      </div>

      {!alert.acknowledged && (
        <Button variant="outline" size="sm" onClick={() => onAcknowledge(alert.id)}>
          <Check className="h-4 w-4 mr-1" />
          确认
        </Button>
      )}
    </div>
  );
}
