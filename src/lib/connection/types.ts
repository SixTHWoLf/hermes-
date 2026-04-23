// Message platform connection status types

export type PlatformType = 'discord' | 'telegram' | 'slack' | 'whatsapp' | 'qq_bot';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'unknown';

export interface PlatformConnectionState {
  platform: PlatformType;
  status: ConnectionStatus;
  lastConnectedAt?: string;
  lastErrorAt?: string;
  errorMessage?: string;
  reconnectAttempts: number;
  isEnabled: boolean;
}

export interface ConnectionState {
  platforms: Record<PlatformType, PlatformConnectionState>;
  lastUpdatedAt: string;
}

export interface ReconnectConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface ConnectionHealth {
  platform: PlatformType;
  healthy: boolean;
  latencyMs?: number;
  lastPingAt?: string;
}

// API response types
export interface ConnectionStateResponse {
  success: boolean;
  data?: ConnectionState;
  error?: string;
}

export interface ReconnectResponse {
  success: boolean;
  platform: PlatformType;
  data?: {
    reconnecting: boolean;
    attempt: number;
    nextRetryAt?: string;
  };
  error?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  data?: ConnectionHealth;
  error?: string;
}
