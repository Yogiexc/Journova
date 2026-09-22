import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { DoiService } from './doi.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('doi')
@UseGuards(JwtAuthGuard)
export class DoiController {
  constructor(private readonly doiService: DoiService) {}

  @Post(':articleId/retry')
  retryDeposit(@Param('articleId') articleId: string) {
    // Fire and forget (async)
    this.doiService.retryDeposit(articleId).catch(err => {
      console.error('Failed to retry DOI deposit', err);
    });
    return { success: true, message: 'DOI deposit retry initiated' };
  }

  @Get(':articleId/status')
  async getStatus(@Param('articleId') articleId: string) {
    const status = await this.doiService.getDepositStatus(articleId);
    return { success: true, data: status };
  }
}
