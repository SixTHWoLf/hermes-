'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMonitoringStore } from '@/store/monitoring-store';
import type { Agent, AgentResourceUsage, Alert } from '@/types/monitoring';

interface MonitoringMessage {
  type: 'agent_update' | 'resource_update' | 'alert';
  data: Agent | AgentResourceUsage | Alert;
}

export function useMonitoringWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setConnected, updateAgent, addResourceUsage, addAlert } = useMonitoringStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setConnected(true);
      };

      wsRef.current.onclose = () => {
        setConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: MonitoringMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'agent_update':
              updateAgent(message.data as Agent);
              break;
            case 'resource_update':
              const resourceUpdate = message.data as AgentResourceUsage;
              addResourceUsage(resourceUpdate.agentId, {
                cpu: resourceUpdate.cpu,
                memory: resourceUpdate.memory,
                disk: resourceUpdate.disk,
                timestamp: resourceUpdate.timestamp,
              });
              break;
            case 'alert':
              addAlert(message.data as Alert);
              break;
          }
        } catch {
          console.error('Failed to parse monitoring message');
        }
      };
    } catch {
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [url, setConnected, updateAgent, addResourceUsage, addAlert]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
