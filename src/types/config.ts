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

export interface DiscordConfig {
  enabled: boolean;
  bot_token?: string;
  guild_id?: string;
  channel_id?: string;
}

export interface TelegramConfig {
  enabled: boolean;
  bot_token?: string;
  chat_id?: string;
  api_id?: string;
  api_hash?: string;
}

export interface SlackConfig {
  enabled: boolean;
  bot_token?: string;
  team_id?: string;
  channel_id?: string;
  signing_secret?: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phone_number?: string;
  auth_token?: string;
  instance_id?: string;
}

export interface QQBotConfig {
  enabled: boolean;
  app_id?: string;
  app_secret?: string;
  access_token?: string;
}

export interface MessagePlatformConfig {
  discord?: DiscordConfig;
  telegram?: TelegramConfig;
  slack?: SlackConfig;
  whatsapp?: WhatsAppConfig;
  qq_bot?: QQBotConfig;
}

export interface HermesConfig {
  model?: ModelConfig;
  agent?: AgentConfig;
  terminal?: TerminalConfig;
  message_platform?: MessagePlatformConfig;
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

export const defaultDiscordConfig: DiscordConfig = {
  enabled: false,
  bot_token: '',
  guild_id: '',
  channel_id: '',
};

export const defaultTelegramConfig: TelegramConfig = {
  enabled: false,
  bot_token: '',
  chat_id: '',
  api_id: '',
  api_hash: '',
};

export const defaultSlackConfig: SlackConfig = {
  enabled: false,
  bot_token: '',
  team_id: '',
  channel_id: '',
  signing_secret: '',
};

export const defaultWhatsAppConfig: WhatsAppConfig = {
  enabled: false,
  phone_number: '',
  auth_token: '',
  instance_id: '',
};

export const defaultQQBotConfig: QQBotConfig = {
  enabled: false,
  app_id: '',
  app_secret: '',
  access_token: '',
};

export const defaultMessagePlatformConfig: MessagePlatformConfig = {
  discord: defaultDiscordConfig,
  telegram: defaultTelegramConfig,
  slack: defaultSlackConfig,
  whatsapp: defaultWhatsAppConfig,
  qq_bot: defaultQQBotConfig,
};

export const defaultHermesConfig: HermesConfig = {
  model: defaultModelConfig,
  agent: defaultAgentConfig,
  terminal: defaultTerminalConfig,
  message_platform: defaultMessagePlatformConfig,
};
