import {
  PlatformType,
  PlatformConnectionState,
  ConnectionState,
  ReconnectConfig,
  ConnectionHealth,
} from './types';

const DEFAULT_RECONNECT_CONFIG: ReconnectConfig = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export class ConnectionService {
  private connectionState: ConnectionState;
  private reconnectConfig: ReconnectConfig;
  private reconnectTimeouts: Map<PlatformType, NodeJS.Timeout>;
  private reconnectAttempts: Map<PlatformType, number>;

  constructor() {
    this.connectionState = this.initializeConnectionState();
    this.reconnectConfig = { ...DEFAULT_RECONNECT_CONFIG };
    this.reconnectTimeouts = new Map();
    this.reconnectAttempts = new Map();
  }

  private initializeConnectionState(): ConnectionState {
    const platforms: Record<PlatformType, PlatformConnectionState> = {
      discord: this.createInitialPlatformState('discord'),
      telegram: this.createInitialPlatformState('telegram'),
      slack: this.createInitialPlatformState('slack'),
      whatsapp: this.createInitialPlatformState('whatsapp'),
      qq_bot: this.createInitialPlatformState('qq_bot'),
    };

    return {
      platforms,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  private createInitialPlatformState(platform: PlatformType): PlatformConnectionState {
    return {
      platform,
      status: 'unknown',
      reconnectAttempts: 0,
      isEnabled: false,
    };
  }

  /**
   * Get connection state for all platforms
   */
  getConnectionState(): ConnectionState {
    return {
      ...this.connectionState,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get connection state for a specific platform
   */
  getPlatformState(platform: PlatformType): PlatformConnectionState {
    return this.connectionState.platforms[platform];
  }

  /**
   * Update platform connection status
   */
  updatePlatformStatus(
    platform: PlatformType,
    status: PlatformConnectionState['status'],
    errorMessage?: string
  ): void {
    const platformState = this.connectionState.platforms[platform];

    this.connectionState.platforms[platform] = {
      ...platformState,
      status,
      lastErrorAt: status === 'error' ? new Date().toISOString() : platformState.lastErrorAt,
      errorMessage: status === 'error' ? errorMessage : undefined,
      lastConnectedAt: status === 'connected' ? new Date().toISOString() : platformState.lastConnectedAt,
    };

    this.connectionState.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Enable/disable a platform
   */
  setPlatformEnabled(platform: PlatformType, enabled: boolean): void {
    this.connectionState.platforms[platform].isEnabled = enabled;

    if (!enabled) {
      this.updatePlatformStatus(platform, 'disconnected');
      this.cancelReconnect(platform);
    }

    this.connectionState.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Check if platform is healthy (connected and responsive)
   */
  async checkPlatformHealth(platform: PlatformType): Promise<ConnectionHealth> {
    const platformState = this.connectionState.platforms[platform];

    // For now, health check is based on connection status
    // In a real implementation, this would ping the actual service
    const healthy = platformState.status === 'connected';
    const latencyMs = healthy ? Math.floor(Math.random() * 100) + 10 : undefined;

    return {
      platform,
      healthy,
      latencyMs,
      lastPingAt: healthy ? new Date().toISOString() : undefined,
    };
  }

  /**
   * Attempt to reconnect a platform
   */
  async reconnect(platform: PlatformType): Promise<{ reconnecting: boolean; attempt: number }> {
    const platformState = this.connectionState.platforms[platform];

    if (!platformState.isEnabled) {
      return { reconnecting: false, attempt: 0 };
    }

    const currentAttempts = this.reconnectAttempts.get(platform) || 0;

    if (currentAttempts >= this.reconnectConfig.maxAttempts) {
      this.updatePlatformStatus(platform, 'error', 'Max reconnection attempts reached');
      this.reconnectAttempts.set(platform, 0);
      return { reconnecting: false, attempt: currentAttempts };
    }

    this.updatePlatformStatus(platform, 'connecting');
    this.reconnectAttempts.set(platform, currentAttempts + 1);

    // Simulate reconnection attempt
    // In real implementation, this would call the actual platform connection logic
    const delay = this.calculateBackoffDelay(currentAttempts);

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // Simulate successful connection for demo
        // In real implementation, this would be based on actual connection result
        const success = Math.random() > 0.3; // 70% success rate for demo

        if (success) {
          this.updatePlatformStatus(platform, 'connected');
          this.reconnectAttempts.set(platform, 0);
          this.cancelReconnect(platform);
        } else {
          const attempts = this.reconnectAttempts.get(platform) || 0;
          if (attempts < this.reconnectConfig.maxAttempts) {
            // Schedule another attempt
            this.scheduleReconnect(platform, attempts);
            resolve({ reconnecting: true, attempt: attempts });
          } else {
            this.updatePlatformStatus(platform, 'error', 'Failed to reconnect after max attempts');
            this.reconnectAttempts.set(platform, 0);
            resolve({ reconnecting: false, attempt: attempts });
          }
        }
      }, delay);

      this.reconnectTimeouts.set(platform, timeout);
    });
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(platform: PlatformType, currentAttempt: number): void {
    this.cancelReconnect(platform);

    const delay = this.calculateBackoffDelay(currentAttempt);
    const timeout = setTimeout(async () => {
      await this.reconnect(platform);
    }, delay);

    this.reconnectTimeouts.set(platform, timeout);
  }

  /**
   * Calculate backoff delay with exponential increase
   */
  private calculateBackoffDelay(attempt: number): number {
    const delay = this.reconnectConfig.baseDelayMs *
      Math.pow(this.reconnectConfig.backoffMultiplier, attempt);

    return Math.min(delay, this.reconnectConfig.maxDelayMs);
  }

  /**
   * Cancel pending reconnection attempt
   */
  private cancelReconnect(platform: PlatformType): void {
    const timeout = this.reconnectTimeouts.get(platform);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(platform);
    }
  }

  /**
   * Reset reconnection attempts for a platform
   */
  resetReconnectAttempts(platform: PlatformType): void {
    this.reconnectAttempts.set(platform, 0);
    this.cancelReconnect(platform);
  }

  /**
   * Get reconnection config
   */
  getReconnectConfig(): ReconnectConfig {
    return { ...this.reconnectConfig };
  }

  /**
   * Update reconnection config
   */
  updateReconnectConfig(config: Partial<ReconnectConfig>): void {
    this.reconnectConfig = { ...this.reconnectConfig, ...config };
  }

  /**
   * Disconnect a platform
   */
  disconnect(platform: PlatformType): void {
    this.cancelReconnect(platform);
    this.reconnectAttempts.set(platform, 0);
    this.updatePlatformStatus(platform, 'disconnected');
  }

  /**
   * Disconnect all platforms
   */
  disconnectAll(): void {
    const platforms: PlatformType[] = ['discord', 'telegram', 'slack', 'whatsapp', 'qq_bot'];
    platforms.forEach(platform => this.disconnect(platform));
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
    this.reconnectAttempts.clear();
  }
}

// Singleton instance
export const connectionService = new ConnectionService();
