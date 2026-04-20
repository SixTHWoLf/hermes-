import { describe, it, expect } from 'vitest';
import {
  defaultModelConfig,
  defaultAgentConfig,
  defaultTerminalConfig,
  defaultHermesConfig,
} from '@/types/config';

describe('config types', () => {
  describe('defaultModelConfig', () => {
    it('should have correct default values', () => {
      expect(defaultModelConfig.default_model).toBe('minimax-cn');
      expect(defaultModelConfig.provider).toBe('minimax-cn');
      expect(defaultModelConfig.base_url).toBe('https://api.minimax.chat');
      expect(defaultModelConfig.api_key).toBe('');
    });
  });

  describe('defaultAgentConfig', () => {
    it('should have correct default values', () => {
      expect(defaultAgentConfig.max_turns).toBe(10);
      expect(defaultAgentConfig.gateway_timeout).toBe(120);
      expect(defaultAgentConfig.tool_use_enforcement).toBe('optional');
      expect(defaultAgentConfig.reasoning_effort).toBe('medium');
      expect(defaultAgentConfig.personalities).toEqual(['default']);
    });
  });

  describe('defaultTerminalConfig', () => {
    it('should have correct default values', () => {
      expect(defaultTerminalConfig.docker_image).toBe('hermes-agent:latest');
      expect(defaultTerminalConfig.cpu).toBe(2);
      expect(defaultTerminalConfig.memory).toBe('4G');
      expect(defaultTerminalConfig.disk).toBe('20G');
      expect(defaultTerminalConfig.timeout).toBe(3600);
      expect(defaultTerminalConfig.workdir).toBe('/app');
    });
  });

  describe('defaultHermesConfig', () => {
    it('should contain all three config sections', () => {
      expect(defaultHermesConfig.model).toBeDefined();
      expect(defaultHermesConfig.agent).toBeDefined();
      expect(defaultHermesConfig.terminal).toBeDefined();
    });

    it('should have correct model config', () => {
      expect(defaultHermesConfig.model?.default_model).toBe('minimax-cn');
    });

    it('should have correct agent config', () => {
      expect(defaultHermesConfig.agent?.max_turns).toBe(10);
    });

    it('should have correct terminal config', () => {
      expect(defaultHermesConfig.terminal?.docker_image).toBe('hermes-agent:latest');
    });
  });
});
