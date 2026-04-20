import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { BackupInfo } from './types';

const BACKUP_DIR = path.join(process.env.HOME || '/root', '.hermes', 'backups');
const MAX_BACKUPS = 10;

export class BackupService {
  private encryptionKey: Buffer | null = null;

  constructor() {
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  /**
   * Set encryption key for backup encryption
   */
  setEncryptionKey(key: string): void {
    // Derive a 32-byte key from the provided key using SHA256
    this.encryptionKey = crypto.createHash('sha256').update(key).digest();
  }

  /**
   * Create a backup of the current configuration
   */
  async createBackup(configContent: string): Promise<BackupInfo> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const id = crypto.randomUUID();
      const filename = `config-${timestamp}-${id.slice(0, 8)}.yaml`;
      const filepath = path.join(BACKUP_DIR, filename);

      // Encrypt content if encryption key is set
      let content = configContent;
      if (this.encryptionKey) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        content = JSON.stringify({ iv: iv.toString('hex'), data: encrypted });
      }

      fs.writeFileSync(filepath, content, 'utf-8');

      // Clean up old backups
      await this.cleanupOldBackups();

      return {
        id,
        filename,
        created_at: new Date().toISOString(),
        size: fs.statSync(filepath).size,
      };
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore configuration from a backup
   */
  async restoreBackup(filename: string): Promise<string> {
    try {
      const filepath = path.join(BACKUP_DIR, filename);

      if (!fs.existsSync(filepath)) {
        throw new Error(`Backup file not found: ${filename}`);
      }

      let content = fs.readFileSync(filepath, 'utf-8');

      // Decrypt if encrypted
      if (this.encryptionKey) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.iv && parsed.data) {
            const iv = Buffer.from(parsed.iv, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
            let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            content = decrypted;
          }
        } catch {
          // Not encrypted JSON, treat as plain content
        }
      }

      return content;
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('config-') && f.endsWith('.yaml'))
        .map(filename => {
          const filepath = path.join(BACKUP_DIR, filename);
          const stats = fs.statSync(filepath);
          return {
            id: filename.replace('config-', '').replace('.yaml', ''),
            filename,
            created_at: stats.mtime.toISOString(),
            size: stats.size,
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return files;
    } catch (error) {
      throw new Error(`Failed to list backups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(filename: string): Promise<void> {
    try {
      const filepath = path.join(BACKUP_DIR, filename);

      if (!fs.existsSync(filepath)) {
        throw new Error(`Backup file not found: ${filename}`);
      }

      fs.unlinkSync(filepath);
    } catch (error) {
      throw new Error(`Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up old backups keeping only the most recent ones
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();

    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      for (const backup of toDelete) {
        const filepath = path.join(BACKUP_DIR, backup.filename);
        fs.unlinkSync(filepath);
      }
    }
  }

  /**
   * Get backup directory path
   */
  getBackupDir(): string {
    return BACKUP_DIR;
  }
}

// Singleton instance
export const backupService = new BackupService();
