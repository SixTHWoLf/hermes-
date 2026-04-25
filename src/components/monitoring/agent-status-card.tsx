'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, AlertTriangle } from 'lucide-react';
import type { Agent, AgentStatus } from '@/types/monitoring';

const statusConfig: Record<AgentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: string }> = {
  online: { label: '在线', variant: 'default', icon: 'bg-green-500' },
  offline: { label: '离线', variant: 'secondary', icon: 'bg-gray-400' },
  busy: { label: '忙碌', variant: 'outline', icon: 'bg-yellow-500' },
  error: { label: '错误', variant: 'destructive', icon: 'bg-red-500' },
};

function formatHeartbeat(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} 小时前`;
  return date.toLocaleDateString('zh-CN');
}

interface AgentStatusCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentStatusCard({ agent, onClick }: AgentStatusCardProps) {
  const config = statusConfig[agent.status];

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.icon}`} />
            <span className="font-medium">{agent.name}</span>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {agent.ip && (
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>{agent.ip}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>心跳: {formatHeartbeat(agent.lastHeartbeat)}</span>
          </div>
          {agent.status === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>连接异常</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
