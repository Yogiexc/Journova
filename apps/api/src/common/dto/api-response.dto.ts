export class ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }
}
