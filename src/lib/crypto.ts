import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

function getEncryptionKey(): Buffer {
  const envKey = process.env.HERMES_ENCRYPTION_KEY;
  if (envKey) {
    return Buffer.from(envKey, 'hex');
  }
  const defaultKeyPath = `${process.env.HOME || '/root'}/.hermes/.key`;
  try {
    if (require('fs').existsSync(defaultKeyPath)) {
      return require('fs').readFileSync(defaultKeyPath);
    }
  } catch {
  }
  const key = crypto.randomBytes(KEY_LENGTH);
  try {
    const keyDir = `${process.env.HOME || '/root'}/.hermes`;
    if (!require('fs').existsSync(keyDir)) {
      require('fs').mkdirSync(keyDir, { recursive: true });
    }
    require('fs').writeFileSync(defaultKeyPath, key);
    require('fs').chmodSync(defaultKeyPath, 0o600);
  } catch {
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }

  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function encryptApiKey(apiKey: string): string {
  return encrypt(apiKey);
}

export function decryptApiKey(encryptedApiKey: string): string {
  return decrypt(encryptedApiKey);
}

export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts.every(p => /^[a-f0-9]{2,}$/i.test(p));
}
