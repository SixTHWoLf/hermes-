import { describe, it, expect, beforeEach } from 'vitest';
import { useMonitoringStore } from './monitoring-store';
import type { AgentUpdate, ResourceUpdate, Alert } from '@/types/monitoring';

describe('MonitoringStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMonitoringStore.setState({
      connectionStatus: 'disconnected',
      reconnectAttempts: 0,
      lastConnectedAt: null,
      agents: new Map(),
      alerts: [],
      unreadAlertCount: 0,
      resourceHistory: new Map(),
    });
  });

  describe('connection status', () => {
    it('should set connection status to connected', () => {
      const { setConnectionStatus } = useMonitoringStore.getState();
      setConnectionStatus('connected');

      const state = useMonitoringStore.getState();
      expect(state.connectionStatus).toBe('connected');
      expect(state.lastConnectedAt).toBeInstanceOf(Date);
    });

    it('should set connection status to disconnected', () => {
      const { setConnectionStatus } = useMonitoringStore.getState();
      setConnectionStatus('connected');
      setConnectionStatus('disconnected');

      const state = useMonitoringStore.getState();
      expect(state.connectionStatus).toBe('disconnected');
    });

    it('should increment reconnect attempts', () => {
      const { incrementReconnectAttempts } = useMonitoringStore.getState();
      incrementReconnectAttempts();
      incrementReconnectAttempts();

      const state = useMonitoringStore.getState();
      expect(state.reconnectAttempts).toBe(2);
    });

    it('should reset reconnect attempts', () => {
      const { incrementReconnectAttempts, resetReconnectAttempts } =
        useMonitoringStore.getState();
      incrementReconnectAttempts();
      incrementReconnectAttempts();
      resetReconnectAttempts();

      const state = useMonitoringStore.getState();
      expect(state.reconnectAttempts).toBe(0);
    });
  });

  describe('agent updates', () => {
    it('should update agent info', () => {
      const { updateAgent } = useMonitoringStore.getState();

      const agentUpdate: AgentUpdate = {
        agent_id: 'agent-1',
        name: 'Test Agent',
        status: 'online',
        agent_type: 'worker',
        last_seen: new Date().toISOString(),
      };

      updateAgent(agentUpdate);

      const state = useMonitoringStore.getState();
      const agent = state.agents.get('agent-1');

      expect(agent).toBeDefined();
      expect(agent?.id).toBe('agent-1');
      expect(agent?.name).toBe('Test Agent');
      expect(agent?.status).toBe('online');
      expect(agent?.agentType).toBe('worker');
    });

    it('should update existing agent resources', () => {
      const { updateAgent, updateAgentResource } = useMonitoringStore.getState();

      const agentUpdate: AgentUpdate = {
        agent_id: 'agent-1',
        name: 'Test Agent',
        status: 'online',
        agent_type: 'worker',
        last_seen: new Date().toISOString(),
      };

      updateAgent(agentUpdate);

      const resourceUpdate: ResourceUpdate = {
        agent_id: 'agent-1',
        cpu_usage: 45.5,
        memory_usage: 60.2,
        disk_usage: 30.0,
        timestamp: new Date().toISOString(),
      };

      updateAgentResource(resourceUpdate);

      const state = useMonitoringStore.getState();
      const agent = state.agents.get('agent-1');

      expect(agent?.resources).toBeDefined();
      expect(agent?.resources?.cpu_usage).toBe(45.5);
      expect(agent?.resources?.memory_usage).toBe(60.2);
      expect(agent?.resources?.disk_usage).toBe(30.0);
    });

    it('should update agent status', () => {
      const { updateAgent } = useMonitoringStore.getState();

      const initialUpdate: AgentUpdate = {
        agent_id: 'agent-1',
        name: 'Test Agent',
        status: 'online',
        agent_type: 'worker',
        last_seen: new Date().toISOString(),
      };

      updateAgent(initialUpdate);

      const statusUpdate: AgentUpdate = {
        agent_id: 'agent-1',
        name: 'Test Agent',
        status: 'busy',
        agent_type: 'worker',
        last_seen: new Date().toISOString(),
      };

      updateAgent(statusUpdate);

      const state = useMonitoringStore.getState();
      const agent = state.agents.get('agent-1');

      expect(agent?.status).toBe('busy');
    });
  });

  describe('resource history', () => {
    it('should add resource history entries', () => {
      const { updateAgentResource } = useMonitoringStore.getState();

      const resourceUpdate: ResourceUpdate = {
        agent_id: 'agent-1',
        cpu_usage: 45.5,
        memory_usage: 60.2,
        disk_usage: 30.0,
        timestamp: new Date().toISOString(),
      };

      updateAgentResource(resourceUpdate);

      const state = useMonitoringStore.getState();
      const history = state.resourceHistory.get('agent-1');

      expect(history).toBeDefined();
      expect(history?.length).toBe(1);
      expect(history?.[0].cpuUsage).toBe(45.5);
    });

    it('should limit resource history to 100 entries', () => {
      const { updateAgentResource } = useMonitoringStore.getState();

      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        const resourceUpdate: ResourceUpdate = {
          agent_id: 'agent-1',
          cpu_usage: i,
          memory_usage: i,
          disk_usage: i,
          timestamp: new Date().toISOString(),
        };
        updateAgentResource(resourceUpdate);
      }

      const state = useMonitoringStore.getState();
      const history = state.resourceHistory.get('agent-1');

      expect(history?.length).toBe(100);
    });
  });

  describe('alerts', () => {
    it('should add alerts', () => {
      const { addAlert } = useMonitoringStore.getState();

      const alert: Alert = {
        id: 'alert-1',
        rule_id: 'rule-1',
        rule_name: 'High CPU',
        agent_id: 'agent-1',
        agent_name: 'Test Agent',
        resource_type: 'cpu',
        current_value: 95.0,
        threshold: 90.0,
        condition: 'gt',
        timestamp: new Date().toISOString(),
      };

      addAlert(alert);

      const state = useMonitoringStore.getState();
      expect(state.alerts.length).toBe(1);
      expect(state.alerts[0].id).toBe('alert-1');
      expect(state.unreadAlertCount).toBe(1);
    });

    it('should limit alerts to 100', () => {
      const { addAlert } = useMonitoringStore.getState();

      // Add 105 alerts
      for (let i = 0; i < 105; i++) {
        const alert: Alert = {
          id: `alert-${i}`,
          rule_id: 'rule-1',
          rule_name: 'High CPU',
          agent_id: 'agent-1',
          agent_name: 'Test Agent',
          resource_type: 'cpu',
          current_value: 95.0,
          threshold: 90.0,
          condition: 'gt',
          timestamp: new Date().toISOString(),
        };
        addAlert(alert);
      }

      const state = useMonitoringStore.getState();
      expect(state.alerts.length).toBe(100);
    });

    it('should clear alerts', () => {
      const { addAlert, clearAlerts } = useMonitoringStore.getState();

      const alert: Alert = {
        id: 'alert-1',
        rule_id: 'rule-1',
        rule_name: 'High CPU',
        agent_id: 'agent-1',
        agent_name: 'Test Agent',
        resource_type: 'cpu',
        current_value: 95.0,
        threshold: 90.0,
        condition: 'gt',
        timestamp: new Date().toISOString(),
      };

      addAlert(alert);
      clearAlerts();

      const state = useMonitoringStore.getState();
      expect(state.alerts.length).toBe(0);
      expect(state.unreadAlertCount).toBe(0);
    });

    it('should mark alerts as read', () => {
      const { addAlert, markAlertsAsRead } = useMonitoringStore.getState();

      const alert: Alert = {
        id: 'alert-1',
        rule_id: 'rule-1',
        rule_name: 'High CPU',
        agent_id: 'agent-1',
        agent_name: 'Test Agent',
        resource_type: 'cpu',
        current_value: 95.0,
        threshold: 90.0,
        condition: 'gt',
        timestamp: new Date().toISOString(),
      };

      addAlert(alert);
      expect(useMonitoringStore.getState().unreadAlertCount).toBe(1);

      markAlertsAsRead();

      const state = useMonitoringStore.getState();
      expect(state.unreadAlertCount).toBe(0);
    });
  });

  describe('clearResourceHistory', () => {
    it('should clear all resource history when no agentId provided', () => {
      const { updateAgentResource, clearResourceHistory } =
        useMonitoringStore.getState();

      const resourceUpdate1: ResourceUpdate = {
        agent_id: 'agent-1',
        cpu_usage: 45.5,
        memory_usage: 60.2,
        disk_usage: 30.0,
        timestamp: new Date().toISOString(),
      };

      const resourceUpdate2: ResourceUpdate = {
        agent_id: 'agent-2',
        cpu_usage: 30.0,
        memory_usage: 40.0,
        disk_usage: 20.0,
        timestamp: new Date().toISOString(),
      };

      updateAgentResource(resourceUpdate1);
      updateAgentResource(resourceUpdate2);

      clearResourceHistory();

      const state = useMonitoringStore.getState();
      expect(state.resourceHistory.size).toBe(0);
    });

    it('should clear resource history for specific agent', () => {
      const { updateAgentResource, clearResourceHistory } =
        useMonitoringStore.getState();

      const resourceUpdate1: ResourceUpdate = {
        agent_id: 'agent-1',
        cpu_usage: 45.5,
        memory_usage: 60.2,
        disk_usage: 30.0,
        timestamp: new Date().toISOString(),
      };

      const resourceUpdate2: ResourceUpdate = {
        agent_id: 'agent-2',
        cpu_usage: 30.0,
        memory_usage: 40.0,
        disk_usage: 20.0,
        timestamp: new Date().toISOString(),
      };

      updateAgentResource(resourceUpdate1);
      updateAgentResource(resourceUpdate2);

      clearResourceHistory('agent-1');

      const state = useMonitoringStore.getState();
      expect(state.resourceHistory.has('agent-1')).toBe(false);
      expect(state.resourceHistory.has('agent-2')).toBe(true);
    });
  });
});