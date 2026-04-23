'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMonitoringStore } from '@/store/monitoring-store';
import type {
  WebSocketConfig,
  MonitoringMessage,
  AgentUpdate,
  ResourceUpdate,
  Alert,
} from '@/types/monitoring';
import { defaultWSConfig } from '@/types/monitoring';

interface UseWebSocketOptions extends Partial<Omit<WebSocketConfig, 'url'>> {
  url: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    reconnectInterval = defaultWSConfig.reconnectInterval,
    maxReconnectAttempts = defaultWSConfig.maxReconnectAttempts,
    pingInterval = defaultWSConfig.pingInterval,
    onConnected,
    onDisconnected,
    onError,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    connectionStatus,
    reconnectAttempts,
    setConnectionStatus,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    updateAgent,
    updateAgentResource,
    addAlert,
  } = useMonitoringStore();

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const startPingInterval = useCallback(() => {
    clearTimers();
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, pingInterval);
  }, [pingInterval, clearTimers]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: MonitoringMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'connected':
            resetReconnectAttempts();
            setConnectionStatus('connected');
            startPingInterval();
            onConnected?.();
            break;

          case 'agent_update': {
            const agentUpdate = message.data as unknown as AgentUpdate;
            updateAgent(agentUpdate);
            break;
          }

          case 'resource_update': {
            const resourceUpdate = message.data as unknown as ResourceUpdate;
            updateAgentResource(resourceUpdate);
            break;
          }

          case 'alert': {
            const alert = message.data as unknown as Alert;
            addAlert(alert);
            break;
          }

          case 'pong':
            // Heartbeat response received
            break;

          case 'error':
            console.error('WebSocket error:', message.data);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    },
    [
      resetReconnectAttempts,
      setConnectionStatus,
      startPingInterval,
      updateAgent,
      updateAgentResource,
      addAlert,
      onConnected,
    ]
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    clearTimers();

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnectionStatus('connected');
        resetReconnectAttempts();
        startPingInterval();
        onConnected?.();
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onclose = (event) => {
        clearTimers();
        setConnectionStatus('disconnected');
        onDisconnected?.();

        // Attempt reconnection if not a clean close
        if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
          setConnectionStatus('reconnecting');
          incrementReconnectAttempts();

          const delay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttempts),
            30000 // Max delay 30 seconds
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setConnectionStatus('disconnected');
    }
  }, [
    url,
    reconnectInterval,
    maxReconnectAttempts,
    reconnectAttempts,
    clearTimers,
    setConnectionStatus,
    resetReconnectAttempts,
    incrementReconnectAttempts,
    startPingInterval,
    handleMessage,
    onConnected,
    onDisconnected,
    onError,
  ]);

  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, [clearTimers, setConnectionStatus]);

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Client unmount');
      }
    };
  }, [connect, clearTimers]);

  return {
    connectionStatus,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    isConnected: connectionStatus === 'connected',
  };
}

// Hook to send agent status updates via WebSocket
export function useAgentStatusSender() {
  const wsRef = useRef<WebSocket | null>(null);

  const sendStatus = useCallback(
    (agentId: string, name: string, status: string, agentType: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'agent_status',
            agent_id: agentId,
            name,
            status,
            agent_type: agentType,
          })
        );
      }
    },
    []
  );

  return { sendStatus };
}