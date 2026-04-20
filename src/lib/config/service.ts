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
