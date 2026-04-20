export interface HermesConfig {
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  timeout?: number;
  retries?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  autoSave?: boolean;
  backupPath?: string;
  maxBackups?: number;
}

export interface BackupInfo {
  id: string;
  filename: string;
  path: string;
  createdAt: string;
  size: number;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const SENSITIVE_FIELDS = ['apiKey', 'apiSecret'] as const;
export type SensitiveField = typeof SENSITIVE_FIELDS[number];
