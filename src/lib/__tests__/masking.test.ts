import { describe, it, expect } from 'vitest';
import { maskSensitiveData, hasSensitiveData } from '../security/masking';
import { HermesConfig } from '../config/types';

describe('maskSensitiveData', () => {
  it('should mask api_key field', () => {
    const config: HermesConfig = {
      model: {
        provider: 'openai',
        api_key: 'sk-test123456789',
      },
    };

    const masked = maskSensitiveData(config);

    expect(masked.model?.api_key).toBe('sk****89');
  });

  it('should mask password field', () => {
    const config = {
      security: {
        tirith: {
          password: 'secretpassword123',
        },
      },
    } as HermesConfig;

    const masked = maskSensitiveData(config);

    expect(masked.security?.tirith?.password).toBe('se****23');
  });

  it('should mask short values', () => {
    const config = {
      model: {
        api_key: 'abc',
      },
    } as HermesConfig;

    const masked = maskSensitiveData(config);

    expect(masked.model?.api_key).toBe('****');
  });

  it('should return original config when no sensitive fields', () => {
    const config: HermesConfig = {
      model: {
        provider: 'openai',
        base_url: 'https://api.openai.com',
      },
    };

    const masked = maskSensitiveData(config);

    expect(masked).toEqual(config);
  });

  it('should handle nested objects', () => {
    const config = {
      auxiliary: {
        mcp: {
          servers: {
            auth: {
              api_key: 'mcp-secret-key-abcdef',
            },
          },
        },
      },
    } as HermesConfig;

    const masked = maskSensitiveData(config);

    expect(masked.auxiliary?.mcp?.servers?.auth?.api_key).toBe('mc****ef');
  });

  it('should handle arrays', () => {
    const config = {
      agent: {
        personalities: ['help', 'api', 'secure'],
      },
    } as HermesConfig;

    const masked = maskSensitiveData(config);

    expect(masked.agent?.personalities).toEqual(['help', 'api', 'secure']);
  });
});

describe('hasSensitiveData', () => {
  it('should return true when api_key exists', () => {
    const config: HermesConfig = {
      model: {
        api_key: 'test',
      },
    };

    expect(hasSensitiveData(config)).toBe(true);
  });

  it('should return true when password exists', () => {
    const config = {
      security: {
        tirith: {
          password: 'secret',
        },
      },
    } as HermesConfig;

    expect(hasSensitiveData(config)).toBe(true);
  });

  it('should return false when no sensitive fields', () => {
    const config: HermesConfig = {
      model: {
        provider: 'openai',
        base_url: 'https://api.openai.com',
      },
    };

    expect(hasSensitiveData(config)).toBe(false);
  });
});
