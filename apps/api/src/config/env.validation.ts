import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000,http://127.0.0.1:3000'),
  COOKIE_SECURE: Joi.boolean().default(false),
  COOKIE_HTTP_ONLY: Joi.boolean().default(true),
  COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('lax'),
  COOKIE_DOMAIN: Joi.string().allow('', null).default(''),
  STORAGE_PROVIDER: Joi.string().valid('local', 's3', 'r2').default('local'),
  S3_BUCKET: Joi.string().allow('', null).optional(),
  S3_REGION: Joi.string().allow('', null).optional(),
  S3_ENDPOINT: Joi.string().allow('', null).optional(),
});
