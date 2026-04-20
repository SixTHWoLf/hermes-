'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { HermesConfig } from '@/types/config';
import { defaultHermesConfig } from '@/types/config';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchConfig(): Promise<HermesConfig> {
  const response = await fetch(`${API_BASE}/config`);
  if (!response.ok) {
    throw new Error('Failed to fetch config');
  }
  const result: ApiResponse<HermesConfig> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch config');
  }
  return result.data;
}

async function saveConfig(config: HermesConfig): Promise<HermesConfig> {
  const response = await fetch(`${API_BASE}/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error('Failed to save config');
  }
  const result: ApiResponse<HermesConfig> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to save config');
  }
  return result.data;
}

async function backupConfig(): Promise<{ backup_path: string }> {
  const response = await fetch(`${API_BASE}/config/backup`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to backup config');
  }
  const result: ApiResponse<{ backup_path: string }> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to backup config');
  }
  return result.data;
}

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
    initialData: defaultHermesConfig,
    staleTime: Infinity,
  });
}

export function useSaveConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(['config'], data);
    },
  });
}

export function useBackupConfig() {
  return useMutation({
    mutationFn: backupConfig,
  });
}
