// Frontend configuration types - aligned with backend types

export interface ModelConfig {
  default_model: string;
  provider: string;
  base_url?: string;
  api_key?: string;
}

export interface AgentConfig {
  max_turns: number;
  gateway_timeout: number;
  tool_use_enforcement: string;
  reasoning_effort: string;
  personalities: string[];
}

export interface TerminalConfig {
  docker_image: string;
  cpu: number;
  memory: string;
  disk: string;
  timeout: number;
  workdir: string;
}

export interface HermesConfig {
  model?: ModelConfig;
  agent?: AgentConfig;
  terminal?: TerminalConfig;
}

// Default configurations - aligned with backend validation
export const defaultModelConfig: ModelConfig = {
  default_model: 'minimax-cn',
  provider: 'minimax-cn',
  base_url: 'https://api.minimax.chat',
  api_key: '',
};

export const defaultAgentConfig: AgentConfig = {
  max_turns: 10,
  gateway_timeout: 120,
  tool_use_enforcement: 'optional',
  reasoning_effort: 'medium',
  personalities: ['default'],
};

export const defaultTerminalConfig: TerminalConfig = {
  docker_image: 'hermes-agent:latest',
  cpu: 2,
  memory: '4G',
  disk: '20G',
  timeout: 3600,
  workdir: '/app',
};

export const defaultHermesConfig: HermesConfig = {
  model: defaultModelConfig,
  agent: defaultAgentConfig,
  terminal: defaultTerminalConfig,
};
