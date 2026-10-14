import { describe, it, expect } from 'vitest';
import { envValidationSchema } from './env.validation.js';

describe('envValidationSchema - Storage Configuration Validation', () => {
  const baseValidEnv = {
    DATABASE_URL: 'postgresql://localhost:5432/db',
    JWT_SECRET: 'super-secret-key-32-chars-long-minimum',
  };

  it('should accept valid default STORAGE_PROVIDER=local without R2 credentials', () => {
    const { error, value } = envValidationSchema.validate({
      ...baseValidEnv,
    });
    expect(error).toBeUndefined();
    expect(value.STORAGE_PROVIDER).toBe('local');
  });

  it('should accept explicit STORAGE_PROVIDER=local with empty R2 fields', () => {
    const { error, value } = envValidationSchema.validate({
      ...baseValidEnv,
      STORAGE_PROVIDER: 'local',
      R2_ACCOUNT_ID: '',
      R2_ACCESS_KEY_ID: '',
      R2_SECRET_ACCESS_KEY: '',
      R2_BUCKET_NAME: '',
    });
    expect(error).toBeUndefined();
    expect(value.STORAGE_PROVIDER).toBe('local');
  });

  it('should reject invalid STORAGE_PROVIDER (e.g. s3 or unknown)', () => {
    const { error } = envValidationSchema.validate({
      ...baseValidEnv,
      STORAGE_PROVIDER: 's3',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('STORAGE_PROVIDER');
  });

  it('should accept STORAGE_PROVIDER=r2 when all required R2 credentials are provided', () => {
    const { error, value } = envValidationSchema.validate({
      ...baseValidEnv,
      STORAGE_PROVIDER: 'r2',
      R2_ACCOUNT_ID: 'test-account-id',
      R2_ACCESS_KEY_ID: 'test-access-key-id',
      R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
      R2_BUCKET_NAME: 'test-bucket',
    });
    expect(error).toBeUndefined();
    expect(value.STORAGE_PROVIDER).toBe('r2');
  });

  it('should fail validation when STORAGE_PROVIDER=r2 and R2_ACCOUNT_ID is missing', () => {
    const { error } = envValidationSchema.validate({
      ...baseValidEnv,
      STORAGE_PROVIDER: 'r2',
      R2_ACCESS_KEY_ID: 'test-access-key-id',
      R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
      R2_BUCKET_NAME: 'test-bucket',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].path).toContain('R2_ACCOUNT_ID');
  });

  it('should fail validation when STORAGE_PROVIDER=r2 and R2_ACCESS_KEY_ID is missing', () => {
    const { error } = envValidationSchema.validate({
      ...baseValidEnv,
      STORAGE_PROVIDER: 'r2',
      R2_ACCOUNT_ID: 'test-account-id',
      R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
      R2_BUCKET_NAME: 'test-bucket',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].path).toContain('R2_ACCESS_KEY_ID');
  });

  it('should fail validation when STORAGE_PROVIDER=r2 and R2_SECRET_ACCESS_KEY is missing', () => {
    const { error } = envValidationSchema.validate({
      ...baseValidEnv,
      STORAGE_PROVIDER: 'r2',
      R2_ACCOUNT_ID: 'test-account-id',
      R2_ACCESS_KEY_ID: 'test-access-key-id',
      R2_BUCKET_NAME: 'test-bucket',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].path).toContain('R2_SECRET_ACCESS_KEY');
  });

  it('should fail validation when STORAGE_PROVIDER=r2 and R2_BUCKET_NAME is missing', () => {
    const { error } = envValidationSchema.validate({
      ...baseValidEnv,
      STORAGE_PROVIDER: 'r2',
      R2_ACCOUNT_ID: 'test-account-id',
      R2_ACCESS_KEY_ID: 'test-access-key-id',
      R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].path).toContain('R2_BUCKET_NAME');
  });
});
