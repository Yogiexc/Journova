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
  STORAGE_PROVIDER: Joi.string().valid('local', 'r2').default('local'),
  R2_ACCOUNT_ID: Joi.string().when('STORAGE_PROVIDER', {
    is: 'r2',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('', null).optional(),
  }),
  R2_ACCESS_KEY_ID: Joi.string().when('STORAGE_PROVIDER', {
    is: 'r2',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('', null).optional(),
  }),
  R2_SECRET_ACCESS_KEY: Joi.string().when('STORAGE_PROVIDER', {
    is: 'r2',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('', null).optional(),
  }),
  R2_BUCKET_NAME: Joi.string().when('STORAGE_PROVIDER', {
    is: 'r2',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('', null).optional().default('journova-storage'),
  }),
});
