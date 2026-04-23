import { PlatformType } from './types';

export interface AutoReconnectOptions {
  platform: PlatformType;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  onStatusChange: (status: 'connecting' | 'connected' | 'disconnected' | 'error', attempt?: number) => void;
  onError: (error: string) => void;
  reconnectFn: () => Promise<boolean>;
}

export class AutoReconnectManager {
  private timeouts: Map<PlatformType, NodeJS.Timeout>;
  private reconnectAttempts: Map<PlatformType, number>;
  private isReconnecting: Map<PlatformType, boolean>;
  private options: Map<PlatformType, AutoReconnectOptions>;

  constructor() {
    this.timeouts = new Map();
    this.reconnectAttempts = new Map();
    this.isReconnecting = new Map();
    this.options = new Map();
  }

  /**
   * Start auto-reconnect for a platform
   */
  startReconnect(options: AutoReconnectOptions): void {
    this.options.set(options.platform, options);
    this.reconnectAttempts.set(options.platform, 0);
    this.isReconnecting.set(options.platform, false);

    // Initial connection attempt
    this.attemptReconnect(options.platform);
  }

  /**
   * Stop auto-reconnect for a platform
   */
  stopReconnect(platform: PlatformType): void {
    const timeout = this.timeouts.get(platform);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(platform);
    }
    this.reconnectAttempts.delete(platform);
    this.isReconnecting.delete(platform);
    this.options.delete(platform);
  }

  /**
   * Stop all auto-reconnect
   */
  stopAll(): void {
    this.options.forEach((_, platform) => this.stopReconnect(platform));
  }

  /**
   * Manually trigger reconnect
   */
  triggerReconnect(platform: PlatformType): void {
    const attempts = this.reconnectAttempts.get(platform) || 0;
    if (attempts < (this.options.get(platform)?.maxAttempts || 5)) {
      this.attemptReconnect(platform);
    }
  }

  /**
   * Get current reconnect attempts for a platform
   */
  getAttempts(platform: PlatformType): number {
    return this.reconnectAttempts.get(platform) || 0;
  }

  /**
   * Check if a platform is currently reconnecting
   */
  isPlatformReconnecting(platform: PlatformType): boolean {
    return this.isReconnecting.get(platform) || false;
  }

  private async attemptReconnect(platform: PlatformType): Promise<void> {
    const options = this.options.get(platform);
    if (!options) return;

    const attempts = this.reconnectAttempts.get(platform) || 0;

    if (attempts >= options.maxAttempts) {
      options.onStatusChange('error', attempts);
      options.onError(`Max reconnection attempts (${options.maxAttempts}) reached`);
      this.stopReconnect(platform);
      return;
    }

    this.isReconnecting.set(platform, true);
    options.onStatusChange('connecting', attempts + 1);

    try {
      const success = await options.reconnectFn();

      if (success) {
        this.reconnectAttempts.set(platform, 0);
        this.isReconnecting.set(platform, false);
        options.onStatusChange('connected');
        this.stopReconnect(platform);
      } else {
        // Schedule next attempt
        this.reconnectAttempts.set(platform, attempts + 1);
        const delay = this.calculateBackoff(attempts, options.baseDelayMs, options.maxDelayMs);

        const timeout = setTimeout(() => {
          this.isReconnecting.set(platform, false);
          this.attemptReconnect(platform);
        }, delay);

        this.timeouts.set(platform, timeout);
      }
    } catch (error) {
      this.isReconnecting.set(platform, false);
      this.reconnectAttempts.set(platform, attempts + 1);
      options.onError(error instanceof Error ? error.message : 'Unknown error');

      const newAttempts = this.reconnectAttempts.get(platform) || 0;
      if (newAttempts < options.maxAttempts) {
        const delay = this.calculateBackoff(newAttempts - 1, options.baseDelayMs, options.maxDelayMs);

        const timeout = setTimeout(() => {
          this.attemptReconnect(platform);
        }, delay);

        this.timeouts.set(platform, timeout);
      } else {
        options.onStatusChange('error', newAttempts);
        this.stopReconnect(platform);
      }
    }
  }

  private calculateBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
    const delay = baseDelayMs * Math.pow(2, attempt);
    return Math.min(delay, maxDelayMs);
  }
}

// Singleton instance
export const autoReconnectManager = new AutoReconnectManager();
