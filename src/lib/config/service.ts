import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { HermesConfig, ConfigValidationResult } from './types';

const CONFIG_PATH = path.join(process.env.HOME || '/root', '.hermes', 'config.yaml');

export class ConfigService {
  private config: HermesConfig | null = null;

  /**
   * Read and parse the configuration file
   */
  async readConfig(): Promise<HermesConfig> {
    try {
      const configDir = path.dirname(CONFIG_PATH);

      // Ensure directory exists
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Create default config if not exists
      if (!fs.existsSync(CONFIG_PATH)) {
        const defaultConfig: HermesConfig = {};
        fs.writeFileSync(CONFIG_PATH, yaml.dump(defaultConfig), 'utf-8');
        this.config = defaultConfig;
        return defaultConfig;
      }

      const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
      this.config = yaml.load(content) as HermesConfig || {};
      return this.config;
    } catch (error) {
      throw new Error(`Failed to read config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write configuration to file
   */
  async writeConfig(config: HermesConfig): Promise<void> {
    try {
      const configDir = path.dirname(CONFIG_PATH);

      // Ensure directory exists
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const content = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      fs.writeFileSync(CONFIG_PATH, content, 'utf-8');
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to write config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current configuration
   */
  async getConfig(): Promise<HermesConfig> {
    if (!this.config) {
      return this.readConfig();
    }
    return this.config;
  }

  /**
   * Update specific fields in the configuration
   */
  async updateConfig(updates: Partial<HermesConfig>): Promise<HermesConfig> {
    const currentConfig = await this.getConfig();
    const newConfig = { ...currentConfig, ...updates };
    await this.writeConfig(newConfig);
    return newConfig;
  }

  /**
   * Validate configuration before saving
   */
  validateConfig(config: HermesConfig): ConfigValidationResult {
    const errors: string[] = [];

    // Validate model config
    if (config.model) {
      if (config.model.provider && !['minimax-cn', 'openai', 'nous', 'anthropic'].includes(config.model.provider)) {
        errors.push(`Invalid provider: ${config.model.provider}`);
      }
      if (config.model.base_url && !this.isValidUrl(config.model.base_url)) {
        errors.push(`Invalid base_url: ${config.model.base_url}`);
      }
    }

    // Validate agent config
    if (config.agent) {
      if (config.agent.max_turns !== undefined && (config.agent.max_turns < 1 || config.agent.max_turns > 100)) {
        errors.push('max_turns must be between 1 and 100');
      }
      if (config.agent.gateway_timeout !== undefined && config.agent.gateway_timeout < 0) {
        errors.push('gateway_timeout must be non-negative');
      }
    }

    // Validate terminal config
    if (config.terminal) {
      if (config.terminal.cpu !== undefined && config.terminal.cpu < 1) {
        errors.push('cpu must be at least 1');
      }
      if (config.terminal.memory) {
        const memMatch = config.terminal.memory.match(/^(\d+)(G|M)$/);
        if (!memMatch) {
          errors.push('memory must be in format like "2G" or "512M"');
        }
      }
    }

    // Validate browser config
    if (config.browser) {
      if (config.browser.inactivity_timeout !== undefined && config.browser.inactivity_timeout < 0) {
        errors.push('browser.inactivity_timeout must be non-negative');
      }
      if (config.browser.cdp_url && !this.isValidUrl(config.browser.cdp_url)) {
        errors.push('browser.cdp_url must be a valid URL');
      }
    }

    // Validate display config
    if (config.display) {
      if (config.display.personality_select && typeof config.display.personality_select !== 'string') {
        errors.push('display.personality_select must be a string');
      }
    }

    // Validate TTS config
    if (config.tts) {
      if (config.tts.provider && !['edge', 'elevenlabs', 'openai'].includes(config.tts.provider)) {
        errors.push(`tts.provider must be one of: edge, elevenlabs, openai`);
      }
    }

    // Validate STT config
    if (config.stt) {
      if (config.stt.provider && !['local', 'openai', 'mistral'].includes(config.stt.provider)) {
        errors.push(`stt.provider must be one of: local, openai, mistral`);
      }
    }

    // Validate code execution config
    if (config.code_execution) {
      if (config.code_execution.mode && !['project', 'sandbox'].includes(config.code_execution.mode)) {
        errors.push('code_execution.mode must be "project" or "sandbox"');
      }
      if (config.code_execution.timeout !== undefined && config.code_execution.timeout < 1) {
        errors.push('code_execution.timeout must be at least 1');
      }
    }

    // Validate memory config
    if (config.memory) {
      if (config.memory.memory_limit) {
        const memMatch = config.memory.memory_limit.match(/^(\d+)(G|M|K)$/);
        if (!memMatch) {
          errors.push('memory.memory_limit must be in format like "2G", "512M", or "256K"');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return CONFIG_PATH;
  }
}

// Singleton instance
export const configService = new ConfigService();
