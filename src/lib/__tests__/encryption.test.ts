import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, deriveKey, generateSecureToken } from '../security/encryption';

describe('encryption', () => {
  const password = 'test-password-123';
  const plaintext = 'sk-test-abcdefghijklmnop';

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt correctly', () => {
      const encrypted = encrypt(plaintext, password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext (due to random IV)', () => {
      const encrypted1 = encrypt(plaintext, password);
      const encrypted2 = encrypt(plaintext, password);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should fail to decrypt with wrong password', () => {
      const encrypted = encrypt(plaintext, password);

      expect(() => decrypt(encrypted, 'wrong-password')).toThrow();
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('', password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).toBe('');
    });

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🔐密码';
      const encrypted = encrypt(unicodeText, password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).toBe(unicodeText);
    });
  });

  describe('deriveKey', () => {
    it('should derive same key from same password and salt', () => {
      const salt = Buffer.from('test-salt-12345678901234567890');
      const key1 = deriveKey(password, salt);
      const key2 = deriveKey(password, salt);

      expect(key1).toEqual(key2);
    });

    it('should derive different keys from different salts', () => {
      const salt1 = Buffer.from('test-salt-11111111111111111111');
      const salt2 = Buffer.from('test-salt-22222222222222222222');
      const key1 = deriveKey(password, salt1);
      const key2 = deriveKey(password, salt2);

      expect(key1).not.toEqual(key2);
    });

    it('should derive 32-byte key', () => {
      const salt = Buffer.from('test-salt-12345678901234567890');
      const key = deriveKey(password, salt);

      expect(key.length).toBe(32);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token16 = generateSecureToken(16);
      const token32 = generateSecureToken(32);

      expect(token16.length).toBe(16);
      expect(token32.length).toBe(32);
    });

    it('should generate different tokens each time', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it('should only contain URL-safe characters', () => {
      const token = generateSecureToken(100);

      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });
});
