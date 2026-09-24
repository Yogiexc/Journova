import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto.js';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('--- EXCEPTION LOG ---');
    console.error(exception);
    console.error('---------------------');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Map Prisma errors to HttpExceptions
    let handledException = exception;
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          handledException = new HttpException('Unique constraint failed', HttpStatus.CONFLICT);
          break;
        case 'P2025':
          handledException = new HttpException('Record not found', HttpStatus.NOT_FOUND);
          break;
        case 'P2003':
          handledException = new HttpException('Foreign key constraint failed', HttpStatus.BAD_REQUEST);
          break;
      }
    }

    const status = 
      handledException instanceof HttpException
        ? handledException.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      handledException instanceof HttpException
        ? handledException.message
        : 'Internal server error';
        
    const code = 
      handledException instanceof HttpException
        ? handledException.name
        : 'INTERNAL_SERVER_ERROR';

    const errorResponse = new ApiResponse({
      success: false,
      error: {
        code,
        message,
        details: handledException instanceof HttpException ? handledException.getResponse() : null,
      },
    });

    response.status(status).json(errorResponse);
  }
}
