import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('--- EXCEPTION LOG ---');
    console.error(exception);
    console.error('---------------------');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';
        
    const code = 
      exception instanceof HttpException
        ? exception.name
        : 'INTERNAL_SERVER_ERROR';

    const errorResponse = new ApiResponse({
      success: false,
      error: {
        code,
        message,
        details: exception instanceof HttpException ? exception.getResponse() : null,
      },
    });

    response.status(status).json(errorResponse);
  }
}
