// Hermes configuration types

export interface ModelConfig {
  default_model: string;
  provider: string;
  base_url?: string;
  api_key?: string;
}

export interface AgentConfig {
  max_turns?: number;
  gateway_timeout?: number;
  tool_use_enforcement?: string;
  reasoning_effort?: string;
  personalities?: string[];
}

export interface TerminalConfig {
  docker_image?: string;
  cpu?: number;
  memory?: string;
  disk?: string;
  timeout?: number;
  workdir?: string;
}

export interface BrowserConfig {
  inactivity_timeout?: number;
  cdp_url?: string;
  session_recording?: boolean;
}

export interface AuxiliaryConfig {
  vision?: boolean;
  web_extract?: boolean;
  compression?: boolean;
  session_search?: boolean;
  skills_hub?: boolean;
  mcp?: Record<string, unknown>;
  memory?: Record<string, unknown>;
}

export interface DisplayConfig {
  compact_mode?: boolean;
  personality_select?: string;
  reasoning_display?: boolean;
  streaming_output?: boolean;
}

export interface TTSConfig {
  provider?: string;
}

export interface STTConfig {
  provider?: string;
}

export interface SecurityConfig {
  redact_secrets?: boolean;
  tirith?: Record<string, unknown>;
  website_blacklist?: string[];
}

export interface MessagePlatformConfig {
  discord?: Record<string, unknown>;
  telegram?: Record<string, unknown>;
  slack?: Record<string, unknown>;
  whatsapp?: Record<string, unknown>;
  qq_bot?: Record<string, unknown>;
}

export interface CodeExecutionConfig {
  mode?: string;
  timeout?: number;
}

export interface MemoryConfig {
  enabled?: boolean;
  memory_limit?: string;
  strategy?: 'recent' | 'important' | 'summary';
}

export interface HermesConfig {
  model?: ModelConfig;
  agent?: AgentConfig;
  terminal?: TerminalConfig;
  browser?: BrowserConfig;
  auxiliary?: AuxiliaryConfig;
  display?: DisplayConfig;
  tts?: TTSConfig;
  stt?: STTConfig;
  security?: SecurityConfig;
  message_platform?: MessagePlatformConfig;
  code_execution?: CodeExecutionConfig;
  memory?: MemoryConfig;
}

export interface BackupInfo {
  id: string;
  filename: string;
  created_at: string;
  size: number;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors?: string[];
}
