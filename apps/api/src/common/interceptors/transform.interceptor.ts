import { Injectable, NestInterceptor, ExecutionContext, CallHandler, StreamableFile } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto.js';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // If data is a StreamableFile, don't wrap it
        if (data instanceof StreamableFile) {
          return data as any;
        }

        // If data is already an ApiResponse, return it as is
        if (data instanceof ApiResponse || (data && data.success !== undefined)) {
          return data;
        }
        
        // Wrap normal data in ApiResponse
        return new ApiResponse({
          success: true,
          data,
        });
      }),
    );
  }
}
