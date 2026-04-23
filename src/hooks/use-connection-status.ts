'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConnectionState, PlatformType, ConnectionHealth } from '@/lib/connection/types';

const CONNECTION_STATUS_URL = '/api/connection/status';
const RECONNECT_URL = '/api/connection/reconnect';
const HEALTH_URL = '/api/connection/health';

const POLL_INTERVAL_MS = 30000; // 30 seconds

interface UseConnectionStatusReturn {
  connectionState: ConnectionState | null;
  loading: boolean;
  error: string | null;
  reconnect: (platform: PlatformType) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useConnectionStatus(): UseConnectionStatusReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(CONNECTION_STATUS_URL);
      const data = await response.json();

      if (data.success) {
        setConnectionState(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch connection status');
      }
    } catch (err) {
      setError('Network error while fetching connection status');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  const reconnect = useCallback(async (platform: PlatformType) => {
    try {
      const response = await fetch(RECONNECT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh status after reconnect
        await fetchStatus();
      } else {
        setError(data.error || 'Failed to reconnect');
      }
    } catch (err) {
      setError('Network error while reconnecting');
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();

    // Set up polling for connection status
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    connectionState,
    loading,
    error,
    reconnect,
    refreshStatus,
  };
}

interface UsePlatformHealthReturn {
  health: ConnectionHealth | null;
  loading: boolean;
  error: string | null;
  checkHealth: () => Promise<void>;
}

export function usePlatformHealth(platform: PlatformType): UsePlatformHealthReturn {
  const [health, setHealth] = useState<ConnectionHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${HEALTH_URL}?platform=${platform}`);
      const data = await response.json();

      if (data.success) {
        setHealth(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to check health');
      }
    } catch (err) {
      setError('Network error while checking health');
    } finally {
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    checkHealth();

    // Poll health status more frequently for active platforms
    const interval = setInterval(checkHealth, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    health,
    loading,
    error,
    checkHealth,
  };
}
