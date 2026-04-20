import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import {
  HermesConfig,
  BackupInfo,
  ConfigValidationResult,
  SENSITIVE_FIELDS,
  SensitiveField
} from './types';

const CONFIG_DIR = path.join(process.env.HOME || '/root', '.hermes');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.yaml');
const BACKUP_DIR = path.join(CONFIG_DIR, 'backups');

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

export function readConfig(): HermesConfig {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_PATH)) {
    return getDefaultConfig();
  }
  const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return yaml.load(content) as HermesConfig || getDefaultConfig();
}

export function writeConfig(config: HermesConfig): void {
  ensureConfigDir();
  const content = yaml.dump(config, { indent: 2 });
  fs.writeFileSync(CONFIG_PATH, content, 'utf-8');
}

export function getDefaultConfig(): HermesConfig {
  return {
    timeout: 30000,
    retries: 3,
    logLevel: 'info',
    theme: 'auto',
    language: 'zh-CN',
    autoSave: true,
    backupPath: BACKUP_DIR,
    maxBackups: 10,
  };
}

export function maskSensitiveFields(config: HermesConfig): HermesConfig {
  const masked = { ...config };
  for (const field of SENSITIVE_FIELDS) {
    if (masked[field]) {
      masked[field] = '********' as never;
    }
  }
  return masked;
}

export function validateConfig(config: HermesConfig): ConfigValidationResult {
  const errors: string[] = [];

  if (config.timeout !== undefined && (config.timeout < 0 || config.timeout > 300000)) {
    errors.push('timeout must be between 0 and 300000 milliseconds');
  }

  if (config.retries !== undefined && (config.retries < 0 || config.retries > 10)) {
    errors.push('retries must be between 0 and 10');
  }

  if (config.logLevel !== undefined) {
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(config.logLevel)) {
      errors.push(`logLevel must be one of: ${validLogLevels.join(', ')}`);
    }
  }

  if (config.theme !== undefined) {
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(config.theme)) {
      errors.push(`theme must be one of: ${validThemes.join(', ')}`);
    }
  }

  if (config.maxBackups !== undefined && (config.maxBackups < 1 || config.maxBackups > 100)) {
    errors.push('maxBackups must be between 1 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createBackup(): BackupInfo {
  ensureConfigDir();
  const config = readConfig();
  const id = uuidv4();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `config-${timestamp}-${id.slice(0, 8)}.yaml`;
  const backupPath = path.join(BACKUP_DIR, filename);

  const content = yaml.dump(config, { indent: 2 });
  fs.writeFileSync(backupPath, content, 'utf-8');

  const stats = fs.statSync(backupPath);

  cleanupOldBackups();

  return {
    id,
    filename,
    path: backupPath,
    createdAt: new Date().toISOString(),
    size: stats.size,
  };
}

export function restoreBackup(backupId: string): HermesConfig {
  const backups = listBackups();
  const backup = backups.find(b => b.id === backupId);

  if (!backup) {
    throw new Error(`Backup not found: ${backupId}`);
  }

  const content = fs.readFileSync(backup.path, 'utf-8');
  const config = yaml.load(content) as HermesConfig;

  const validation = validateConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid backup configuration: ${validation.errors.join(', ')}`);
  }

  writeConfig(config);
  return config;
}

export function listBackups(): BackupInfo[] {
  ensureConfigDir();
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('config-') && f.endsWith('.yaml'))
    .map(filename => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stats = fs.statSync(filePath);
      const parts = filename.replace('.yaml', '').split('-');
      const id = parts[parts.length - 1];
      const createdAt = stats.mtime.toISOString();

      return {
        id,
        filename,
        path: filePath,
        createdAt,
        size: stats.size,
      } as BackupInfo;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return files;
}

export function cleanupOldBackups(): void {
  const config = readConfig();
  const maxBackups = config.maxBackups || 10;
  const backups = listBackups();

  if (backups.length > maxBackups) {
    const toDelete = backups.slice(maxBackups);
    for (const backup of toDelete) {
      fs.unlinkSync(backup.path);
    }
  }
}

export function getBackupDir(): string {
  return BACKUP_DIR;
}
