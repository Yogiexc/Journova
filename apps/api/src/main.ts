import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { getLoggerConfig } from './config/logger.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLoggerConfig(),
  });
  const configService = app.get(ConfigService);
  
  // Apply Global Middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "validator.swagger.io"],
      },
    },
  }));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000');
  const allowedOrigins = corsOriginsRaw
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(pattern => {
        if (pattern === origin) return true;
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
          return regex.test(origin);
        }
        return false;
      });

      if (isAllowed || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Journova API')
    .setDescription('The API documentation for Journova platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
