'use client';

import { useEffect, useState } from 'react';
import { useMonitoringStore } from '@/store/monitoring-store';
import { AgentStatusList } from '@/components/monitoring/agent-status-list';
import { ResourceChart } from '@/components/monitoring/resource-chart';
import { ResourceGauge } from '@/components/monitoring/resource-gauge';
import { AlertRulesConfig } from '@/components/monitoring/alert-rules-config';
import { AlertHistory } from '@/components/monitoring/alert-history';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Wifi, WifiOff } from 'lucide-react';
import type { Agent, Alert, AlertRule, ResourceUsage } from '@/types/monitoring';

const mockAgents: Agent[] = [
  { id: '1', name: 'Backend Agent', status: 'online', lastHeartbeat: new Date().toISOString(), ip: '192.168.1.10' },
  { id: '2', name: 'Frontend Agent', status: 'busy', lastHeartbeat: new Date().toISOString(), ip: '192.168.1.11' },
  { id: '3', name: 'Security Agent', status: 'online', lastHeartbeat: new Date(Date.now() - 300000).toISOString(), ip: '192.168.1.12' },
  { id: '4', name: 'DevOps Agent', status: 'offline', lastHeartbeat: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.13' },
];

function generateMockData(_agentId: string): ResourceUsage[] {
  const data: ResourceUsage[] = [];
  const now = Date.now();

  for (let i = 23; i >= 0; i--) {
    data.push({
      cpu: 30 + Math.random() * 40 + (i % 3) * 10,
      memory: 40 + Math.random() * 30 + (i % 4) * 5,
      disk: 50 + Math.random() * 20,
      timestamp: new Date(now - i * 60000).toISOString(),
    });
  }

  return data;
}

export function MonitoringDashboard() {
  const { agents, resourceUsage, isConnected, setAgents, addResourceUsage } = useMonitoringStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (agents.length === 0) {
      setAgents(mockAgents);
    }
  }, [agents.length, setAgents]);

  useEffect(() => {
    if (selectedAgentId && !resourceUsage[selectedAgentId]) {
      const mockData = generateMockData(selectedAgentId);
      mockData.forEach((d) => addResourceUsage(selectedAgentId, d));
    }
  }, [selectedAgentId, resourceUsage, addResourceUsage]);

  const displayAgents = agents.length > 0 ? agents : mockAgents;
  const currentAgentId = selectedAgentId || displayAgents[0]?.id;
  const currentUsage = currentAgentId ? (resourceUsage[currentAgentId] || []) : [];

  const latestUsage = currentUsage[currentUsage.length - 1];

  const cpuThreshold = 80;
  const memoryThreshold = 85;
  const diskThreshold = 90;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Hermes Console</h1>
          <Badge variant="outline" className="text-xs">
            监控仪表板
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="h-3 w-3 mr-1" />
              已连接
            </Badge>
          ) : (
            <Badge variant="secondary">
              <WifiOff className="h-3 w-3 mr-1" />
              未连接
            </Badge>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <AgentStatusList
            agents={displayAgents}
            selectedAgentId={currentAgentId}
            onSelectAgent={setSelectedAgentId}
          />

          <Separator />

          {currentAgentId && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-4">
                  资源使用情况 - {displayAgents.find((a) => a.id === currentAgentId)?.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <ResourceGauge
                    metric="cpu"
                    value={latestUsage?.cpu || 0}
                    threshold={cpuThreshold}
                  />
                  <ResourceGauge
                    metric="memory"
                    value={latestUsage?.memory || 0}
                    threshold={memoryThreshold}
                  />
                  <ResourceGauge
                    metric="disk"
                    value={latestUsage?.disk || 0}
                    threshold={diskThreshold}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>历史趋势</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="cpu" className="w-full">
                      <TabsList>
                        <TabsTrigger value="cpu">CPU</TabsTrigger>
                        <TabsTrigger value="memory">内存</TabsTrigger>
                        <TabsTrigger value="disk">磁盘</TabsTrigger>
                      </TabsList>
                      <TabsContent value="cpu" className="mt-4">
                        <ResourceChart
                          data={currentUsage}
                          metric="cpu"
                          thresholds={[cpuThreshold]}
                        />
                      </TabsContent>
                      <TabsContent value="memory" className="mt-4">
                        <ResourceChart
                          data={currentUsage}
                          metric="memory"
                          thresholds={[memoryThreshold]}
                        />
                      </TabsContent>
                      <TabsContent value="disk" className="mt-4">
                        <ResourceChart
                          data={currentUsage}
                          metric="disk"
                          thresholds={[diskThreshold]}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              <Separator />
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertRulesConfig />
            <AlertHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
