'use client';

import { useMonitoringStore } from '@/store/monitoring-store';
import type { ConnectionStatus } from '@/types/monitoring';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
  showReconnectInfo?: boolean;
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string; bgColor: string }
> = {
  connecting: {
    label: '连接中',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
  },
  connected: {
    label: '已连接',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
  },
  disconnected: {
    label: '已断开',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
  },
  reconnecting: {
    label: '重连中',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
  },
};

export function ConnectionStatusIndicator({
  className = '',
  showLabel = true,
  showReconnectInfo = false,
}: ConnectionStatusProps) {
  const connectionStatus = useMonitoringStore((state) => state.connectionStatus);
  const reconnectAttempts = useMonitoringStore((state) => state.reconnectAttempts);

  const config = statusConfig[connectionStatus];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.bgColor}`} />
      {showLabel && (
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
      {showReconnectInfo && connectionStatus === 'reconnecting' && (
        <span className="text-xs text-muted-foreground">
          (尝试 {reconnectAttempts} 次)
        </span>
      )}
    </div>
  );
}

interface ConnectionStatusBannerProps {
  className?: string;
}

export function ConnectionStatusBanner({ className = '' }: ConnectionStatusBannerProps) {
  const connectionStatus = useMonitoringStore((state) => state.connectionStatus);
  const reconnectAttempts = useMonitoringStore((state) => state.reconnectAttempts);

  if (connectionStatus === 'connected') {
    return null;
  }

  const config = statusConfig[connectionStatus];

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-muted ${config.color} ${className}`}
    >
      <div className={`w-2 h-2 rounded-full ${config.bgColor} animate-pulse`} />
      <span className="text-sm font-medium">
        {config.label}
        {connectionStatus === 'reconnecting' && ` (尝试 ${reconnectAttempts} 次)`}
      </span>
    </div>
  );
}