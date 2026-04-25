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
import { ResourceChart } from './resource-chart';
import type { Agent, ResourceUsage } from '@/types/monitoring';
import { useEffect } from 'react';

const TAB_ITEMS: { id: MonitoringTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: '概览', icon: <Activity className="h-4 w-4" /> },
  { id: 'agents', label: 'Agent 状态', icon: <Users className="h-4 w-4" /> },
  { id: 'resources', label: '资源图表', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'alerts', label: '告警管理', icon: <Bell className="h-4 w-4" /> },
];

// Mock data for demo
const MOCK_AGENTS: Agent[] = [
  { id: '1', name: 'Agent-Frontend', status: 'online', lastHeartbeat: new Date().toISOString(), ip: '192.168.1.101' },
  { id: '2', name: 'Agent-Backend', status: 'busy', lastHeartbeat: new Date(Date.now() - 30000).toISOString(), ip: '192.168.1.102' },
  { id: '3', name: 'Agent-Worker', status: 'online', lastHeartbeat: new Date().toISOString(), ip: '192.168.1.103' },
  { id: '4', name: 'Agent-DB', status: 'offline', lastHeartbeat: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.104' },
];

function generateMockResourceHistory(): ResourceUsage[] {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => ({
    cpu: 30 + Math.random() * 40 + Math.sin(i / 3) * 15,
    memory: 40 + Math.random() * 30 + Math.cos(i / 4) * 10,
    disk: 50 + Math.random() * 10,
    timestamp: new Date(now - (19 - i) * 3000).toISOString(),
  }));
}

export function MonitoringDashboard() {
  const { activeTab, setActiveTab, isConnected, agents, alerts, setAgents, addResourceUsage } = useMonitoringStore();

  // Initialize mock data for demo
  useEffect(() => {
    if (agents.length === 0) {
      setAgents(MOCK_AGENTS);
      
      // Generate mock resource data for demo
      MOCK_AGENTS.forEach(agent => {
        if (agent.status !== 'offline') {
          const history = generateMockResourceHistory();
          history.forEach(usage => addResourceUsage(agent.id, usage));
        }
      });
    }
  }, [agents.length, setAgents, addResourceUsage]);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">运行时监控</h1>
          <Badge variant={isConnected ? 'default' : 'secondary'} className="text-xs">
            {isConnected ? '已连接' : '演示模式'}
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
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            <Activity className="h-3 w-3 mr-1" />
            演示模式
          </Badge>
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

  // Calculate average resources from all agents
  const onlineAgentResources = agents.filter(a => a.status === 'online' || a.status === 'busy');
  const avgCpu = onlineAgentResources.length > 0 
    ? onlineAgentResources.reduce((sum, a) => sum + (a as any).cpu || 0, 0) / onlineAgentResources.length 
    : 0;
  const avgMemory = onlineAgentResources.length > 0 
    ? onlineAgentResources.reduce((sum, a) => sum + (a as any).memory || 0, 0) / onlineAgentResources.length 
    : 0;
  const avgDisk = onlineAgentResources.length > 0 
    ? onlineAgentResources.reduce((sum, a) => sum + (a as any).disk || 0, 0) / onlineAgentResources.length 
    : 0;

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
        <ResourceGauge metric="cpu" value={avgCpu || 45} threshold={80} />
        <ResourceGauge metric="memory" value={avgMemory || 62} threshold={85} />
        <ResourceGauge metric="disk" value={avgDisk || 55} threshold={90} />
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
  const { agents, resourceUsage } = useMonitoringStore();

  // Aggregate resource usage across all agents
  const allUsage: ResourceUsage[] = [];
  Object.values(resourceUsage).forEach((usageList) => {
    allUsage.push(...usageList);
  });
  
  // Sort by timestamp
  allUsage.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (allUsage.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">暂无资源数据</p>
        <p className="text-xs text-muted-foreground mt-2">等待 WebSocket 连接获取实时数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">CPU 使用率</h3>
          <ResourceChart data={allUsage} metric="cpu" thresholds={[80]} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">内存使用率</h3>
          <ResourceChart data={allUsage} metric="memory" thresholds={[85]} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">磁盘使用率</h3>
          <ResourceChart data={allUsage} metric="disk" thresholds={[90]} />
        </CardContent>
      </Card>
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
