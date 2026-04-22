import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Create mocks using vi.hoisted
const { mockGetConfig, mockCreateBackup, mockListBackups } = vi.hoisted(() => ({
  mockGetConfig: vi.fn(),
  mockCreateBackup: vi.fn(),
  mockListBackups: vi.fn(),
}));

// Set up module mocks
vi.mock('@/lib/config/service', () => ({
  configService: {
    getConfig: mockGetConfig,
  },
}));

vi.mock('@/lib/config/backup', () => ({
  backupService: {
    createBackup: mockCreateBackup,
    listBackups: mockListBackups,
  },
}));

// Import the route handlers after mocking
import { GET, POST } from './route';

describe('API Config Backup Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/config/backup', () => {
    it('should create backup successfully', async () => {
      const mockConfig = { model: { provider: 'openai' } };
      const mockBackupInfo = {
        id: 'test-id',
        filename: 'config-2024-01-01-test.yaml',
        created_at: '2024-01-01T00:00:00.000Z',
        size: 1024,
      };

      mockGetConfig.mockResolvedValue(mockConfig);
      mockCreateBackup.mockResolvedValue(mockBackupInfo);

      const response = await POST({} as NextRequest);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockBackupInfo);
    });

    it('should handle backup creation errors', async () => {
      mockGetConfig.mockResolvedValue({});
      mockCreateBackup.mockRejectedValue(new Error('Backup failed'));

      const response = await POST({} as NextRequest);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create backup');
    });
  });

  describe('GET /api/config/backup/list', () => {
    it('should list backups successfully', async () => {
      const mockBackups = [
        {
          id: 'backup-1',
          filename: 'config-2024-01-01-1.yaml',
          created_at: '2024-01-01T00:00:00.000Z',
          size: 1024,
        },
        {
          id: 'backup-2',
          filename: 'config-2024-01-02-2.yaml',
          created_at: '2024-01-02T00:00:00.000Z',
          size: 2048,
        },
      ];

      mockListBackups.mockResolvedValue(mockBackups);

      const response = await GET();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockBackups);
    });

    it('should handle list errors', async () => {
      mockListBackups.mockRejectedValue(new Error('List failed'));

      const response = await GET();

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to list backups');
    });
  });
});
