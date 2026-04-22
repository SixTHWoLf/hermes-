import {
  ModelConfig,
  AgentConfig,
  TerminalConfig,
  BrowserConfig,
  DisplayConfig,
  CodeExecutionConfig,
  HermesConfig,
} from './types';

export const defaultModelConfig: ModelConfig = {
  default_model: 'gpt-4',
  provider: 'openai',
  base_url: 'https://api.openai.com/v1',
};

export const defaultAgentConfig: AgentConfig = {
  max_turns: 10,
  gateway_timeout: 300,
  tool_use_enforcement: 'auto',
  reasoning_effort: 'medium',
  personalities: ['default'],
};

export const defaultTerminalConfig: TerminalConfig = {
  docker_image: 'hermes/terminal:latest',
  cpu: 2,
  memory: '2G',
  disk: '20G',
  timeout: 600,
  workdir: '/app',
};

export const defaultBrowserConfig: BrowserConfig = {
  inactivity_timeout: 300,
  cdp_url: 'ws://localhost:9222',
  session_recording: false,
};

export const defaultDisplayConfig: DisplayConfig = {
  compact_mode: false,
  personality_select: 'default',
  reasoning_display: true,
  streaming_output: true,
};

export const defaultCodeExecutionConfig: CodeExecutionConfig = {
  mode: 'sandbox',
  timeout: 300,
};

export const defaultHermesConfig: HermesConfig = {
  model: defaultModelConfig,
  agent: defaultAgentConfig,
  terminal: defaultTerminalConfig,
  browser: defaultBrowserConfig,
  display: defaultDisplayConfig,
  code_execution: defaultCodeExecutionConfig,
};

// Preset templates
export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<HermesConfig>;
}

export const configTemplates: ConfigTemplate[] = [
  {
    id: 'minimal',
    name: '最小配置',
    description: '仅包含必需项的最简配置',
    config: {
      model: {
        default_model: 'gpt-4',
        provider: 'openai',
      },
    },
  },
  {
    id: 'development',
    name: '开发环境',
    description: '适合日常开发的配置',
    config: {
      model: {
        default_model: 'gpt-4',
        provider: 'openai',
        base_url: 'https://api.openai.com/v1',
      },
      agent: {
        max_turns: 20,
        reasoning_effort: 'high',
      },
      terminal: {
        docker_image: 'hermes/terminal:dev',
        timeout: 1800,
      },
      display: {
        reasoning_display: true,
        streaming_output: true,
      },
    },
  },
  {
    id: 'production',
    name: '生产环境',
    description: '适合生产环境的高稳定性配置',
    config: {
      model: {
        default_model: 'gpt-4-turbo',
        provider: 'openai',
        base_url: 'https://api.openai.com/v1',
      },
      agent: {
        max_turns: 50,
        gateway_timeout: 600,
        reasoning_effort: 'medium',
      },
      terminal: {
        docker_image: 'hermes/terminal:prod',
        cpu: 4,
        memory: '4G',
        timeout: 3600,
      },
      display: {
        compact_mode: true,
        streaming_output: true,
      },
      code_execution: {
        mode: 'sandbox',
        timeout: 600,
      },
    },
  },
  {
    id: 'local-ai',
    name: '本地 AI',
    description: '使用本地部署的 AI 模型',
    config: {
      model: {
        default_model: 'llama2',
        provider: 'nous',
        base_url: 'http://localhost:11434/v1',
      },
      agent: {
        max_turns: 30,
        reasoning_effort: 'low',
      },
    },
  },
];
