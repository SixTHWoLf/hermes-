import { HermesConfig } from '../config/types';

// Fields that should be masked in API responses
const SENSITIVE_FIELDS = [
  'api_key',
  'password',
  'secret',
  'token',
  'private_key',
];

// Fields that contain secrets that need encryption
const SECRET_FIELDS = [
  'api_key',
];

export function maskSensitiveData(config: HermesConfig): HermesConfig {
  const masked = JSON.parse(JSON.stringify(config)); // Deep clone

  maskObject(masked);

  return masked;
}

function maskObject(obj: unknown): void {
  if (obj === null || obj === undefined) {
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      maskObject(item);
    }
    return;
  }

  if (typeof obj === 'object') {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const value = (obj as Record<string, unknown>)[key];

      if (SENSITIVE_FIELDS.includes(key.toLowerCase()) && typeof value === 'string') {
        (obj as Record<string, unknown>)[key] = maskValue(value);
      } else if (typeof value === 'object') {
        maskObject(value);
      }
    }
  }
}

function maskValue(value: string): string {
  if (value.length <= 4) {
    return '****';
  }

  // Show first 2 and last 2 characters
  return value.slice(0, 2) + '****' + value.slice(-2);
}

export function hasSensitiveData(config: HermesConfig): boolean {
  const configStr = JSON.stringify(config).toLowerCase();

  for (const field of SENSITIVE_FIELDS) {
    if (configStr.includes(field.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export function isSecretField(fieldName: string): boolean {
  return SECRET_FIELDS.includes(fieldName.toLowerCase());
}
