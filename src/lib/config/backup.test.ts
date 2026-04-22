import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mocks using vi.hoisted before any imports
const { mockExistsSync, mockMkdirSync, mockReadFileSync, mockWriteFileSync, mockUnlinkSync, mockReaddirSync, mockStatSync } = vi.hoisted(() => ({
  mockExistsSync: vi.fn().mockReturnValue(true),
  mockMkdirSync: vi.fn().mockReturnValue(undefined),
  mockReadFileSync: vi.fn().mockReturnValue('test config content'),
  mockWriteFileSync: vi.fn().mockReturnValue(undefined),
  mockUnlinkSync: vi.fn().mockReturnValue(undefined),
  mockReaddirSync: vi.fn().mockReturnValue([]),
  mockStatSync: vi.fn().mockReturnValue({ size: 100, mtime: new Date('2024-01-01') }),
}));

// Mock fs module before importing BackupService
vi.mock('fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
  writeFileSync: (...args: unknown[]) => mockWriteFileSync(...args),
  unlinkSync: (...args: unknown[]) => mockUnlinkSync(...args),
  readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
  statSync: (...args: unknown[]) => mockStatSync(...args),
}));

// Import BackupService after mocks are set up
import { BackupService } from './backup';

describe('BackupService', () => {
  let service: BackupService;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    mockMkdirSync.mockReturnValue(undefined);
    mockWriteFileSync.mockReturnValue(undefined);
    mockReadFileSync.mockReturnValue('test config content');
    mockStatSync.mockReturnValue({ size: 100, mtime: new Date('2024-01-01') });
    // Create service after mocks are set up
    service = new BackupService();
  });

  describe('setEncryptionKey', () => {
    it('should set encryption key without throwing', () => {
      expect(() => service.setEncryptionKey('test-password')).not.toThrow();
    });
  });

  describe('createBackup', () => {
    it('should create a backup file', async () => {
      mockReaddirSync.mockReturnValue([]);

      const result = await service.createBackup('test config content');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/^config-.*\.yaml$/);
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('size');
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('should create encrypted backup when key is set', async () => {
      mockReaddirSync.mockReturnValue([]);
      service.setEncryptionKey('test-password');

      const result = await service.createBackup('test config content');

      expect(result).toHaveProperty('id');
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('should handle backup creation errors', async () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(service.createBackup('test')).rejects.toThrow('Failed to create backup');
    });
  });

  describe('restoreBackup', () => {
    it('should restore a backup file', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('restored config content');

      const result = await service.restoreBackup('config-test.yaml');

      expect(result).toBe('restored config content');
    });

    it('should throw error when backup file not found', async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(service.restoreBackup('nonexistent.yaml'))
        .rejects.toThrow('Backup file not found: nonexistent.yaml');
    });
  });

  describe('listBackups', () => {
    it('should list backup files sorted by date', async () => {
      mockReaddirSync.mockReturnValue([
        'config-2024-01-01-1.yaml',
        'config-2024-01-02-2.yaml',
      ]);
      mockStatSync.mockReturnValue({ size: 100, mtime: new Date('2024-01-02') });

      const backups = await service.listBackups();

      expect(backups.length).toBe(2);
      expect(backups[0]).toHaveProperty('id');
      expect(backups[0]).toHaveProperty('filename');
      expect(backups[0]).toHaveProperty('created_at');
      expect(backups[0]).toHaveProperty('size');
    });

    it('should filter non-backup files', async () => {
      mockReaddirSync.mockReturnValue([
        'config-backup.yaml',
        'other-file.txt',
        'config-2024-01-01.yaml',
      ]);
      mockStatSync.mockReturnValue({ size: 100, mtime: new Date() });

      const backups = await service.listBackups();

      expect(backups.length).toBe(2);
      backups.forEach(backup => {
        expect(backup.filename).toMatch(/^config-.*\.yaml$/);
      });
    });

    it('should return empty array when no backups', async () => {
      mockReaddirSync.mockReturnValue([]);

      const backups = await service.listBackups();

      expect(backups).toEqual([]);
    });

    it('should handle listBackups errors', async () => {
      mockReaddirSync.mockImplementation(() => {
        throw new Error('Access denied');
      });

      await expect(service.listBackups()).rejects.toThrow('Failed to list backups');
    });
  });

  describe('deleteBackup', () => {
    it('should delete a backup file', async () => {
      mockExistsSync.mockReturnValue(true);

      await service.deleteBackup('config-test.yaml');

      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should throw error when backup file not found', async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(service.deleteBackup('nonexistent.yaml'))
        .rejects.toThrow('Backup file not found: nonexistent.yaml');
    });

    it('should handle delete errors', async () => {
      mockExistsSync.mockReturnValue(true);
      mockUnlinkSync.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await expect(service.deleteBackup('config-test.yaml'))
        .rejects.toThrow('Failed to delete backup');
    });
  });

  describe('getBackupDir', () => {
    it('should return the backup directory path', () => {
      const dir = service.getBackupDir();
      expect(dir).toBeDefined();
      expect(typeof dir).toBe('string');
      expect(dir).toContain('.hermes');
    });
  });
});
