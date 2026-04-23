'use client';

import { useMonitoringStore, MonitoringTab } from '@/store/monitoring-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Activity, Users, BarChart3, Bell, Wifi, WifiOff, Settings } from 'lucide-react';
import { AgentStatusList } from './agent-status-list';
import { AlertHistory } from './alert-history';
import { AlertRulesConfig } from './alert-rules-config';
import { Card, CardContent } from '@/components/ui/card';
import { ResourceGauge } from './resource-gauge';

const TAB_ITEMS: { id: MonitoringTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: '概览', icon: <Activity className="h-4 w-4" /> },
  { id: 'agents', label: 'Agent 状态', icon: <Users className="h-4 w-4" /> },
  { id: 'resources', label: '资源图表', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'alerts', label: '告警管理', icon: <Bell className="h-4 w-4" /> },
];

export function MonitoringDashboard() {
  const { activeTab, setActiveTab, isConnected, agents, alerts } = useMonitoringStore();

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">运行时监控</h1>
          <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
            {isConnected ? '已连接' : '未连接'}
          </Badge>
          <Separator orientation="vertical" className="h-6" />
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              配置
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="text-green-500 border-green-500">
              <Wifi className="h-3 w-3 mr-1" />
              WebSocket 已连接
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-500 border-red-500">
              <WifiOff className="h-3 w-3 mr-1" />
              WebSocket 未连接
            </Badge>
          )}
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" disabled>
            <Activity className="h-4 w-4 mr-1" />
            {agents.length} Agent
          </Button>
          {unacknowledgedAlerts > 0 && (
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4 mr-1" />
              告警
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unacknowledgedAlerts}
              </span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <div className="flex gap-2 border-b pb-2">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <TabsContent value={activeTab} className="flex-1 overflow-auto p-6 m-0">
            {activeTab === 'overview' && <OverviewPanel />}
            {activeTab === 'agents' && <AgentsPanel />}
            {activeTab === 'resources' && <ResourcesPanel />}
            {activeTab === 'alerts' && <AlertsPanel />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewPanel() {
  const { agents, alerts } = useMonitoringStore();
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;
  const offlineAgents = agents.filter(a => a.status === 'offline').length;
  const errorAgents = agents.filter(a => a.status === 'error').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">在线 Agent</div>
            <div className="text-2xl font-bold text-green-500">{onlineAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">忙碌 Agent</div>
            <div className="text-2xl font-bold text-yellow-500">{busyAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">错误 Agent</div>
            <div className="text-2xl font-bold text-red-500">{errorAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">离线 Agent</div>
            <div className="text-2xl font-bold text-gray-400">{offlineAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">未确认告警</div>
            <div className="text-2xl font-bold text-orange-500">{unacknowledgedAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ResourceGauge metric="cpu" value={0} />
        <ResourceGauge metric="memory" value={0} />
        <ResourceGauge metric="disk" value={0} />
      </div>

      <AlertHistory maxItems={5} />
    </div>
  );
}

function AgentsPanel() {
  const { agents } = useMonitoringStore();

  return <AgentStatusList agents={agents} />;
}

function ResourcesPanel() {
  return (
    <div className="text-center py-8">
      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">资源图表组件待实现</p>
      <p className="text-xs text-muted-foreground mt-2">WebSocket 连接后自动显示实时数据</p>
    </div>
  );
}

function AlertsPanel() {
  return (
    <div className="space-y-6">
      <AlertRulesConfig />
      <AlertHistory />
    </div>
  );
}
