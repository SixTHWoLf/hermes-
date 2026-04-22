import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from './service';

// Mock fs module - services only need validation which doesn't use fs
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}));

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    service = new ConfigService();
    vi.clearAllMocks();
  });

  describe('validateConfig', () => {
    it('should return valid for empty config', () => {
      const result = service.validateConfig({});
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate provider field', () => {
      const result = service.validateConfig({
        model: { provider: 'openai', default_model: 'gpt-4' },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid provider', () => {
      const result = service.validateConfig({
        model: { provider: 'invalid-provider', default_model: 'test' },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid provider: invalid-provider');
    });

    it('should validate valid base_url', () => {
      const result = service.validateConfig({
        model: { provider: 'openai', base_url: 'https://api.openai.com', default_model: 'gpt-4' },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid base_url', () => {
      const result = service.validateConfig({
        model: { provider: 'openai', base_url: 'not-a-url', default_model: 'gpt-4' },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid base_url: not-a-url');
    });

    it('should validate max_turns within range', () => {
      const result = service.validateConfig({
        agent: { max_turns: 50 },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject max_turns below minimum', () => {
      const result = service.validateConfig({
        agent: { max_turns: 0 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('max_turns must be between 1 and 100');
    });

    it('should reject max_turns above maximum', () => {
      const result = service.validateConfig({
        agent: { max_turns: 101 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('max_turns must be between 1 and 100');
    });

    it('should validate gateway_timeout', () => {
      const result = service.validateConfig({
        agent: { gateway_timeout: 60 },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject negative gateway_timeout', () => {
      const result = service.validateConfig({
        agent: { gateway_timeout: -1 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('gateway_timeout must be non-negative');
    });

    it('should validate cpu', () => {
      const result = service.validateConfig({
        terminal: { cpu: 4 },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject cpu below minimum', () => {
      const result = service.validateConfig({
        terminal: { cpu: 0 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('cpu must be at least 1');
    });

    it('should validate memory format G', () => {
      const result = service.validateConfig({
        terminal: { memory: '4G' },
      });
      expect(result.valid).toBe(true);
    });

    it('should validate memory format M', () => {
      const result = service.validateConfig({
        terminal: { memory: '512M' },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid memory format', () => {
      const result = service.validateConfig({
        terminal: { memory: 'invalid' },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('memory must be in format like "2G" or "512M"');
    });

    it('should collect multiple errors', () => {
      const result = service.validateConfig({
        model: { provider: 'invalid', base_url: 'not-url', default_model: 'test' },
        agent: { max_turns: 0 },
        terminal: { cpu: 0, memory: 'bad' },
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
    });
  });

  describe('getConfigPath', () => {
    it('should return the config path', () => {
      const configPath = service.getConfigPath();
      expect(configPath).toBeDefined();
      expect(typeof configPath).toBe('string');
    });
  });
});
