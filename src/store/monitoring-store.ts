import { create } from 'zustand';
import type { Agent, Alert, AlertRule as AlertRuleType, ResourceUsage } from '@/types/monitoring';

export type MonitoringTab = 'overview' | 'agents' | 'resources' | 'alerts';

interface MonitoringStore {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  activeTab: MonitoringTab;
  agents: Agent[];
  resourceUsage: Map<string, ResourceUsage[]>;
  alertRules: AlertRuleType[];
  alerts: Alert[];

  setConnected: (connected: boolean) => void;
  setConnectionStatus: (status: MonitoringStore['connectionStatus']) => void;
  setActiveTab: (tab: MonitoringTab) => void;
  updateAgent: (agent: Agent) => void;
  setAgents: (agents: Agent[]) => void;
  addResourceUsage: (agentId: string, usage: ResourceUsage) => void;
  setAlertRules: (rules: AlertRuleType[]) => void;
  addAlertRule: (rule: AlertRuleType) => void;
  updateAlertRule: (rule: AlertRuleType) => void;
  deleteAlertRule: (ruleId: string) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
}

export const useMonitoringStore = create<MonitoringStore>((set) => ({
  isConnected: false,
  connectionStatus: 'disconnected',
  activeTab: 'overview',
  agents: [],
  resourceUsage: new Map(),
  alertRules: [
    { id: '1', name: 'CPU 高负载', metric: 'cpu', threshold: 80, enabled: true, createdAt: new Date().toISOString() },
    { id: '2', name: '内存高负载', metric: 'memory', threshold: 85, enabled: true, createdAt: new Date().toISOString() },
    { id: '3', name: '磁盘高负载', metric: 'disk', threshold: 90, enabled: true, createdAt: new Date().toISOString() },
  ],
  alerts: [],

  setConnected: (isConnected) => set({ isConnected }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus, isConnected: connectionStatus === 'connected' }),
  setActiveTab: (activeTab) => set({ activeTab }),
  updateAgent: (agent) => set((state) => {
    const exists = state.agents.find(a => a.id === agent.id);
    if (exists) {
      return { agents: state.agents.map(a => a.id === agent.id ? agent : a) };
    }
    return { agents: [...state.agents, agent] };
  }),
  setAgents: (agents) => set({ agents }),
  addResourceUsage: (agentId, usage) => set((state) => {
    const newMap = new Map(state.resourceUsage);
    const existing = newMap.get(agentId) || [];
    newMap.set(agentId, [...existing.slice(-99), usage]);
    return { resourceUsage: newMap };
  }),
  setAlertRules: (alertRules) => set({ alertRules }),
  addAlertRule: (rule) => set((state) => ({
    alertRules: [...state.alertRules, rule],
  })),
  updateAlertRule: (rule) => set((state) => ({
    alertRules: state.alertRules.map(r => r.id === rule.id ? rule : r),
  })),
  deleteAlertRule: (ruleId) => set((state) => ({
    alertRules: state.alertRules.filter(r => r.id !== ruleId),
  })),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 100),
  })),
  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a),
  })),
  clearAlerts: () => set({ alerts: [] }),
}));
