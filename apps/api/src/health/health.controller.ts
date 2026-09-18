import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ApiResponse } from '../common/dto/api-response.dto.js';

@Controller('api/v1/health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    let databaseStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (e) {
      console.error('Database connection failed', e);
    }

    return new ApiResponse({
      success: true,
      data: {
        status: 'ok',
        database: databaseStatus,
      },
    });
  }
}
