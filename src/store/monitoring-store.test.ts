import { describe, it, expect } from 'vitest';
import { useMonitoringStore } from '@/store/monitoring-store';
import type { Agent, ResourceUsage, AlertRule, Alert } from '@/types/monitoring';

describe('useMonitoringStore', () => {
  it('should set agents', () => {
    const store = useMonitoringStore.getState();

    const agents: Agent[] = [
      { id: '1', name: 'Test Agent', status: 'online', lastHeartbeat: new Date().toISOString() },
    ];

    store.setAgents(agents);
    expect(useMonitoringStore.getState().agents).toEqual(agents);
  });

  it('should update an existing agent', () => {
    const store = useMonitoringStore.getState();

    const initialAgent: Agent = {
      id: '1',
      name: 'Test Agent',
      status: 'online',
      lastHeartbeat: new Date().toISOString(),
    };

    store.setAgents([initialAgent]);

    const updatedAgent: Agent = {
      ...initialAgent,
      status: 'busy',
    };

    store.updateAgent(updatedAgent);
    expect(useMonitoringStore.getState().agents[0].status).toBe('busy');
  });

  it('should add resource usage for an agent', () => {
    const store = useMonitoringStore.getState();

    const usage: ResourceUsage = {
      cpu: 50,
      memory: 60,
      disk: 70,
      timestamp: new Date().toISOString(),
    };

    store.addResourceUsage('agent-1', usage);
    expect(useMonitoringStore.getState().resourceUsage['agent-1']).toHaveLength(1);
    expect(useMonitoringStore.getState().resourceUsage['agent-1'][0].cpu).toBe(50);
  });

  it('should limit resource usage history to 144 entries (24 hours at 10min intervals)', () => {
    const store = useMonitoringStore.getState();

    const baseTime = Date.now();
    for (let i = 0; i < 150; i++) {
      store.addResourceUsage('agent-1', {
        cpu: 50 + i,
        memory: 60,
        disk: 70,
        timestamp: new Date(baseTime + i * 60000).toISOString(),
      });
    }

    const usage = useMonitoringStore.getState().resourceUsage['agent-1'];
    expect(usage).toHaveLength(144);
    expect(usage[usage.length - 1].cpu).toBe(199);
  });

  it('should add alert rules', () => {
    const store = useMonitoringStore.getState();

    const rule: AlertRule = {
      id: 'rule-1',
      name: 'CPU Alert',
      metric: 'cpu',
      threshold: 80,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    store.addAlertRule(rule);
    expect(useMonitoringStore.getState().alertRules).toHaveLength(1);
    expect(useMonitoringStore.getState().alertRules[0].name).toBe('CPU Alert');
  });

  it('should update alert rule', () => {
    const store = useMonitoringStore.getState();

    const rule: AlertRule = {
      id: 'rule-1',
      name: 'CPU Alert',
      metric: 'cpu',
      threshold: 80,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    store.addAlertRule(rule);
    store.updateAlertRule({ ...rule, threshold: 90 });
    expect(useMonitoringStore.getState().alertRules[0].threshold).toBe(90);
  });

  it('should delete alert rule', () => {
    const store = useMonitoringStore.getState();

    const rule: AlertRule = {
      id: 'rule-1',
      name: 'CPU Alert',
      metric: 'cpu',
      threshold: 80,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    store.addAlertRule(rule);
    store.deleteAlertRule('rule-1');
    expect(useMonitoringStore.getState().alertRules).toHaveLength(0);
  });

  it('should add and acknowledge alerts', () => {
    const store = useMonitoringStore.getState();

    const alert: Alert = {
      id: 'alert-1',
      ruleId: 'rule-1',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      metric: 'cpu',
      value: 85,
      threshold: 80,
      triggeredAt: new Date().toISOString(),
      acknowledged: false,
    };

    store.addAlert(alert);
    expect(useMonitoringStore.getState().alerts).toHaveLength(1);
    expect(useMonitoringStore.getState().alerts[0].acknowledged).toBe(false);

    store.acknowledgeAlert('alert-1');
    expect(useMonitoringStore.getState().alerts[0].acknowledged).toBe(true);
  });

  it('should set connected status', () => {
    const store = useMonitoringStore.getState();

    store.setConnected(true);
    expect(useMonitoringStore.getState().isConnected).toBe(true);

    store.setConnected(false);
    expect(useMonitoringStore.getState().isConnected).toBe(false);
  });
});
