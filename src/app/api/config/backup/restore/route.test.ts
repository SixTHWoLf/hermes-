import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Create mocks using vi.hoisted
const { mockRestoreBackup, mockValidateConfig, mockWriteConfig } = vi.hoisted(() => ({
  mockRestoreBackup: vi.fn(),
  mockValidateConfig: vi.fn(),
  mockWriteConfig: vi.fn(),
}));

// Set up module mocks
vi.mock('@/lib/config/service', () => ({
  configService: {
    validateConfig: mockValidateConfig,
    writeConfig: mockWriteConfig,
  },
}));

vi.mock('@/lib/config/backup', () => ({
  backupService: {
    restoreBackup: mockRestoreBackup,
  },
}));

// Import the route handlers after mocking
import { POST } from './route';

describe('API Config Backup Restore Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/config/backup/restore', () => {
    it('should restore backup successfully', async () => {
      const mockConfig = {
        model: { provider: 'openai', default_model: 'gpt-4' },
        agent: { max_turns: 10 },
      };

      mockRestoreBackup.mockResolvedValue('model:\n  provider: openai\n  default_model: gpt-4\nagent:\n  max_turns: 10\n');
      mockValidateConfig.mockReturnValue({ valid: true });
      mockWriteConfig.mockResolvedValue(undefined);

      const request = {
        json: vi.fn().mockResolvedValue({ filename: 'config-2024-01-01-test.yaml' }),
      } as unknown as NextRequest;

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Configuration restored successfully');
    });

    it('should reject request without filename', async () => {
      const request = {
        json: vi.fn().mockResolvedValue({}),
      } as unknown as NextRequest;

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Backup filename is required');
    });

    it('should reject invalid restored config', async () => {
      mockRestoreBackup.mockResolvedValue('invalid: config');
      mockValidateConfig.mockReturnValue({
        valid: false,
        errors: ['Invalid config structure'],
      });

      const request = {
        json: vi.fn().mockResolvedValue({ filename: 'config-2024-01-01-test.yaml' }),
      } as unknown as NextRequest;

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Restored configuration is invalid');
      expect(data.details).toContain('Invalid config structure');
    });

    it('should handle restore errors', async () => {
      mockRestoreBackup.mockRejectedValue(new Error('Backup file not found'));

      const request = {
        json: vi.fn().mockResolvedValue({ filename: 'nonexistent.yaml' }),
      } as unknown as NextRequest;

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Backup file not found');
    });

    it('should handle write config errors', async () => {
      mockRestoreBackup.mockResolvedValue('model:\n  provider: openai');
      mockValidateConfig.mockReturnValue({ valid: true });
      mockWriteConfig.mockRejectedValue(new Error('Write permission denied'));

      const request = {
        json: vi.fn().mockResolvedValue({ filename: 'config-2024-01-01-test.yaml' }),
      } as unknown as NextRequest;

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Write permission denied');
    });
  });
});
