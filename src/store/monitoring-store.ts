'use client';

import { create } from 'zustand';
import type { Agent, AgentResourceUsage, Alert, AlertRule, ResourceUsage } from '@/types/monitoring';

interface MonitoringStore {
  agents: Agent[];
  resourceUsage: Record<string, ResourceUsage[]>;
  alertRules: AlertRule[];
  alerts: Alert[];
  isConnected: boolean;

  setAgents: (agents: Agent[]) => void;
  updateAgent: (agent: Agent) => void;
  addResourceUsage: (agentId: string, usage: ResourceUsage) => void;
  setAlertRules: (rules: AlertRule[]) => void;
  addAlertRule: (rule: AlertRule) => void;
  updateAlertRule: (rule: AlertRule) => void;
  deleteAlertRule: (ruleId: string) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  setConnected: (connected: boolean) => void;
}

export const useMonitoringStore = create<MonitoringStore>((set) => ({
  agents: [],
  resourceUsage: {},
  alertRules: [],
  alerts: [],
  isConnected: false,

  setAgents: (agents) => set({ agents }),

  updateAgent: (agent) =>
    set((state) => ({
      agents: state.agents.some((a) => a.id === agent.id)
        ? state.agents.map((a) => (a.id === agent.id ? agent : a))
        : [...state.agents, agent],
    })),

  addResourceUsage: (agentId, usage) =>
    set((state) => {
      const existing = state.resourceUsage[agentId] || [];
      const last24Hours = existing.slice(-143);
      return {
        resourceUsage: {
          ...state.resourceUsage,
          [agentId]: [...last24Hours, usage],
        },
      };
    }),

  setAlertRules: (rules) => set({ alertRules: rules }),

  addAlertRule: (rule) =>
    set((state) => ({
      alertRules: [...state.alertRules, rule],
    })),

  updateAlertRule: (rule) =>
    set((state) => ({
      alertRules: state.alertRules.map((r) => (r.id === rule.id ? rule : r)),
    })),

  deleteAlertRule: (ruleId) =>
    set((state) => ({
      alertRules: state.alertRules.filter((r) => r.id !== ruleId),
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100),
    })),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    })),

  setConnected: (connected) => set({ isConnected: connected }),
}));
