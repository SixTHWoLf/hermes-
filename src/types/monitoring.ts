export type AgentStatus = 'online' | 'offline' | 'busy' | 'error';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  lastHeartbeat: string;
  ip?: string;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  timestamp: string;
}

export interface AgentResourceUsage extends ResourceUsage {
  agentId: string;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: 'cpu' | 'memory' | 'disk';
  threshold: number;
  enabled: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  agentId: string;
  agentName: string;
  metric: 'cpu' | 'memory' | 'disk';
  value: number;
  threshold: number;
  triggeredAt: string;
  acknowledged: boolean;
}

export interface MonitoringState {
  agents: Agent[];
  resourceUsage: Map<string, ResourceUsage[]>;
  alertRules: AlertRule[];
  alerts: Alert[];
  isConnected: boolean;
}
