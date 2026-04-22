import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HermesConfig } from '@/lib/config/types';
import { NextRequest } from 'next/server';

// Create mocks using vi.hoisted
const { mockGetConfig, mockUpdateConfig, mockValidateConfig, mockMaskSensitiveData } = vi.hoisted(() => ({
  mockGetConfig: vi.fn(),
  mockUpdateConfig: vi.fn(),
  mockValidateConfig: vi.fn(),
  mockMaskSensitiveData: vi.fn((config: HermesConfig) => config),
}));

// Set up module mocks
vi.mock('@/lib/config/service', () => ({
  configService: {
    getConfig: mockGetConfig,
    updateConfig: mockUpdateConfig,
    validateConfig: mockValidateConfig,
  },
}));

vi.mock('@/lib/security/masking', () => ({
  maskSensitiveData: mockMaskSensitiveData,
}));

// Import the route handlers after mocking
import { GET, PUT } from './route';

describe('API Config Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/config', () => {
    it('should return config successfully', async () => {
      const mockConfig: HermesConfig = {
        model: {
          default_model: 'minimax-cn',
          provider: 'minimax-cn',
          base_url: 'https://api.minimax.chat',
        },
      };
      mockGetConfig.mockResolvedValue(mockConfig);

      const response = await GET();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockConfig);
    });

    it('should handle errors gracefully', async () => {
      mockGetConfig.mockRejectedValue(new Error('Config read error'));

      const response = await GET();

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to read configuration');
    });
  });

  describe('PUT /api/config', () => {
    it('should update config successfully', async () => {
      const mockConfig: HermesConfig = {
        model: {
          default_model: 'openai',
          provider: 'openai',
          base_url: 'https://api.openai.com',
        },
      };
      mockValidateConfig.mockReturnValue({ valid: true });
      mockUpdateConfig.mockResolvedValue(mockConfig);

      const request = {
        json: vi.fn().mockResolvedValue(mockConfig),
      } as unknown as NextRequest;

      const response = await PUT(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockConfig);
    });

    it('should reject invalid config', async () => {
      const invalidConfig = {
        model: { provider: 'invalid-provider' },
      };
      mockValidateConfig.mockReturnValue({
        valid: false,
        errors: ['Invalid provider: invalid-provider'],
      });

      const request = {
        json: vi.fn().mockResolvedValue(invalidConfig),
      } as unknown as NextRequest;

      const response = await PUT(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toContain('Invalid provider: invalid-provider');
    });

    it('should handle update errors', async () => {
      mockValidateConfig.mockReturnValue({ valid: true });
      mockUpdateConfig.mockRejectedValue(new Error('Write failed'));

      const request = {
        json: vi.fn().mockResolvedValue({ model: {} }),
      } as unknown as NextRequest;

      const response = await PUT(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to update configuration');
    });
  });
});
