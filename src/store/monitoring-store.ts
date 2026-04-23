import { create } from 'zustand';
import type {
  AgentInfo,
  AgentUpdate,
  ResourceUpdate,
  Alert,
  ConnectionStatus,
  ResourceHistoryEntry,
} from '@/types/monitoring';

interface MonitoringStore {
  // Connection state
  connectionStatus: ConnectionStatus;
  reconnectAttempts: number;
  lastConnectedAt: Date | null;

  // Agents
  agents: Map<string, AgentInfo>;

  // Alerts
  alerts: Alert[];
  unreadAlertCount: number;

  // Resource history (last 100 entries per agent)
  resourceHistory: Map<string, ResourceHistoryEntry[]>;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  updateAgent: (update: AgentUpdate) => void;
  updateAgentResource: (update: ResourceUpdate) => void;
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
  markAlertsAsRead: () => void;
  addResourceHistoryEntry: (entry: ResourceHistoryEntry) => void;
  clearResourceHistory: (agentId?: string) => void;
}

const MAX_HISTORY_ENTRIES = 100;

export const useMonitoringStore = create<MonitoringStore>((set, get) => ({
  connectionStatus: 'disconnected',
  reconnectAttempts: 0,
  lastConnectedAt: null,
  agents: new Map(),
  alerts: [],
  unreadAlertCount: 0,
  resourceHistory: new Map(),

  setConnectionStatus: (status) =>
    set((state) => ({
      connectionStatus: status,
      lastConnectedAt:
        status === 'connected' ? new Date() : state.lastConnectedAt,
    })),

  incrementReconnectAttempts: () =>
    set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1,
    })),

  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

  updateAgent: (update) =>
    set((state) => {
      const agents = new Map(state.agents);
      const existingAgent = agents.get(update.agent_id);

      agents.set(update.agent_id, {
        id: update.agent_id,
        name: update.name,
        status: update.status,
        agentType: update.agent_type,
        lastSeen: new Date(update.last_seen),
        resources: existingAgent?.resources,
      });

      return { agents };
    }),

  updateAgentResource: (update) =>
    set((state) => {
      const agents = new Map(state.agents);
      const existingAgent = agents.get(update.agent_id);

      agents.set(update.agent_id, {
        id: update.agent_id,
        name: existingAgent?.name || '',
        status: existingAgent?.status || 'offline',
        agentType: existingAgent?.agentType || '',
        lastSeen: existingAgent?.lastSeen || new Date(),
        resources: {
          agent_id: update.agent_id,
          cpu_usage: update.cpu_usage,
          memory_usage: update.memory_usage,
          disk_usage: update.disk_usage,
          timestamp: update.timestamp,
        },
      });

      // Also add to resource history
      const resourceHistory = new Map(state.resourceHistory);
      const history = resourceHistory.get(update.agent_id) || [];
      const newEntry: ResourceHistoryEntry = {
        agentId: update.agent_id,
        cpuUsage: update.cpu_usage,
        memoryUsage: update.memory_usage,
        diskUsage: update.disk_usage,
        timestamp: new Date(update.timestamp),
      };

      // Keep only last MAX_HISTORY_ENTRIES
      const updatedHistory = [...history, newEntry].slice(-MAX_HISTORY_ENTRIES);
      resourceHistory.set(update.agent_id, updatedHistory);

      return { agents, resourceHistory };
    }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100), // Keep last 100 alerts
      unreadAlertCount: state.unreadAlertCount + 1,
    })),

  clearAlerts: () => set({ alerts: [], unreadAlertCount: 0 }),

  markAlertsAsRead: () => set({ unreadAlertCount: 0 }),

  addResourceHistoryEntry: (entry) =>
    set((state) => {
      const resourceHistory = new Map(state.resourceHistory);
      const history = resourceHistory.get(entry.agentId) || [];
      const updatedHistory = [...history, entry].slice(-MAX_HISTORY_ENTRIES);
      resourceHistory.set(entry.agentId, updatedHistory);
      return { resourceHistory };
    }),

  clearResourceHistory: (agentId) =>
    set((state) => {
      const resourceHistory = new Map(state.resourceHistory);
      if (agentId) {
        resourceHistory.delete(agentId);
      } else {
        resourceHistory.clear();
      }
      return { resourceHistory };
    }),
}));

// Selectors
export const selectAgents = (state: MonitoringStore) => Array.from(state.agents.values());
export const selectAgentById = (state: MonitoringStore, agentId: string) => state.agents.get(agentId);
export const selectAlerts = (state: MonitoringStore) => state.alerts;
export const selectUnreadAlertCount = (state: MonitoringStore) => state.unreadAlertCount;
export const selectConnectionStatus = (state: MonitoringStore) => state.connectionStatus;
export const selectResourceHistory = (state: MonitoringStore, agentId: string) =>
  state.resourceHistory.get(agentId) || [];