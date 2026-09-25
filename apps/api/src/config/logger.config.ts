import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const sensitiveKeys = ['password', 'accessToken', 'refreshToken', 'token', 'authorization', 'cookie'];

const redactSensitive = winston.format((info) => {
  const clone = { ...info };
  
  const redact = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        redact(obj[key]);
      }
    }
  };

  redact(clone);
  return clone;
});

export const getLoggerConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return WinstonModule.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      redactSensitive(),
      winston.format.timestamp(),
      isProduction
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              return `[${timestamp}] ${level} [${context || 'App'}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });
};
