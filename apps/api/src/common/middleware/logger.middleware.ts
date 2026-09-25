import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, headers, body } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log({
        message: `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
        method,
        url: originalUrl,
        statusCode,
        headers, // Sensitive headers will be redacted by winston format
        body, // Sensitive body fields will be redacted by winston format
      });
    });

    next();
  }
}
