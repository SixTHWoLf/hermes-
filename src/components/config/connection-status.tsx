'use client';

import { useConnectionStatus } from '@/hooks/use-connection-status';
import { PlatformType, ConnectionStatus } from '@/lib/connection/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wifi, WifiOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const PLATFORM_NAMES: Record<PlatformType, string> = {
  discord: 'Discord',
  telegram: 'Telegram',
  slack: 'Slack',
  whatsapp: 'WhatsApp',
  qq_bot: 'QQ Bot',
};

const STATUS_CONFIG: Record<ConnectionStatus, { icon: React.ReactNode; color: string; label: string }> = {
  connected: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-500', label: '已连接' },
  disconnected: { icon: <WifiOff className="h-4 w-4" />, color: 'text-gray-500', label: '已断开' },
  connecting: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-yellow-500', label: '连接中' },
  error: { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500', label: '错误' },
  unknown: { icon: <Wifi className="h-4 w-4" />, color: 'text-gray-400', label: '未知' },
};

interface PlatformStatusCardProps {
  platform: PlatformType;
  status: ConnectionStatus;
  isEnabled: boolean;
  lastConnectedAt?: string;
  errorMessage?: string;
  reconnectAttempts: number;
  onReconnect: () => void;
  onToggleEnabled: (enabled: boolean) => void;
}

function PlatformStatusCard({
  platform,
  status,
  isEnabled,
  lastConnectedAt,
  errorMessage,
  reconnectAttempts,
  onReconnect,
  onToggleEnabled,
}: PlatformStatusCardProps) {
  const config = STATUS_CONFIG[status];
  const isReconnecting = status === 'connecting';

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${config.color}`}>
              {config.icon}
            </div>
            <div>
              <CardTitle>{PLATFORM_NAMES[platform]}</CardTitle>
              <CardDescription>
                <Badge variant={isEnabled ? 'default' : 'secondary'}>
                  {isEnabled ? '已启用' : '已禁用'}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${config.color} border-current`}
            >
              {config.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastConnectedAt && (
          <p className="text-sm text-muted-foreground">
            上次连接: {new Date(lastConnectedAt).toLocaleString('zh-CN')}
          </p>
        )}
        {errorMessage && (
          <p className="text-sm text-red-500">
            错误: {errorMessage}
          </p>
        )}
        {reconnectAttempts > 0 && (
          <p className="text-sm text-yellow-500">
            重连尝试: {reconnectAttempts}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            disabled={isReconnecting || !isEnabled}
            className="flex items-center gap-2"
          >
            {isReconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            重连
          </Button>
          <Button
            variant={isEnabled ? 'destructive' : 'default'}
            size="sm"
            onClick={() => onToggleEnabled(!isEnabled)}
          >
            {isEnabled ? '禁用' : '启用'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConnectionStatusMonitor() {
  const { connectionState, loading, error, reconnect, refreshStatus } = useConnectionStatus();

  const platforms: PlatformType[] = ['discord', 'telegram', 'slack', 'whatsapp', 'qq_bot'];

  if (loading && !connectionState) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500">
        <CardContent className="flex items-center gap-2 p-4 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refreshStatus}>
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">消息平台连接状态</h2>
          <p className="text-sm text-muted-foreground">
            监控各消息平台的连接状态
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshStatus} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {connectionState && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => {
            const state = connectionState.platforms[platform];
            return (
              <PlatformStatusCard
                key={platform}
                platform={platform}
                status={state.status}
                isEnabled={state.isEnabled}
                lastConnectedAt={state.lastConnectedAt}
                errorMessage={state.errorMessage}
                reconnectAttempts={state.reconnectAttempts}
                onReconnect={() => reconnect(platform)}
                onToggleEnabled={() => {}}
              />
            );
          })}
        </div>
      )}

      {connectionState && (
        <p className="text-sm text-muted-foreground text-center">
          最后更新: {new Date(connectionState.lastUpdatedAt).toLocaleString('zh-CN')}
        </p>
      )}
    </div>
  );
}
