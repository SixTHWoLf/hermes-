// Agent status types
export type AgentStatus = 'online' | 'offline' | 'busy';

// Agent update from WebSocket
export interface AgentUpdate {
  agent_id: string;
  name: string;
  status: AgentStatus;
  agent_type: string;
  last_seen: string;
}

// Resource usage update from WebSocket
export interface ResourceUpdate {
  agent_id: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  timestamp: string;
}

// Alert notification from WebSocket
export interface Alert {
  id: string;
  rule_id: string;
  rule_name: string;
  agent_id: string;
  agent_name: string;
  resource_type: 'cpu' | 'memory' | 'disk';
  current_value: number;
  threshold: number;
  condition: 'gt' | 'lt' | 'gte' | 'lte';
  timestamp: string;
}

// WebSocket message types
export type WSMessageType =
  | 'connected'
  | 'agent_update'
  | 'resource_update'
  | 'alert'
  | 'pong'
  | 'error';

// Monitoring data message from WebSocket
export interface MonitoringMessage {
  type: WSMessageType;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  pongTimeout?: number;
}

// Default WebSocket configuration
export const defaultWSConfig: Required<Omit<WebSocketConfig, 'url'>> = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
  pongTimeout: 60000,
};

// Agent info stored in monitoring store
export interface AgentInfo {
  id: string;
  name: string;
  status: AgentStatus;
  agentType: string;
  lastSeen: Date;
  resources?: ResourceUpdate;
}

// Resource history entry
export interface ResourceHistoryEntry {
  agentId: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  timestamp: Date;
}