import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PublicationsService } from './publications.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ScheduleArticleDto, UploadEditorialFileDto } from './dto/publication.dto.js';

@Controller('api/v1/editor/publications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EDITOR')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  getQueue() {
    return this.publicationsService.getPublicationQueue();
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.publicationsService.getPublicationDetail(id);
  }

  @Post(':id/start-copyediting')
  startCopyediting(@Param('id') id: string) {
    return this.publicationsService.startCopyediting(id);
  }

  @Post(':id/start-production')
  startProduction(@Param('id') id: string) {
    return this.publicationsService.startProduction(id);
  }

  @Post(':id/files')
  uploadFile(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UploadEditorialFileDto
  ) {
    // Mocking file buffer for MVP
    const fileData = {
      filename: `mock-${dto.stage.toLowerCase()}-${Date.now()}.pdf`,
      originalname: `mock-${dto.stage.toLowerCase()}.pdf`,
      mimetype: 'application/pdf',
      size: 1024 * 500
    };
    return this.publicationsService.uploadEditorialFile(id, req.user.id, fileData, dto.stage, dto.notes);
  }

  @Post(':id/schedule')
  schedule(@Param('id') id: string, @Body() dto: ScheduleArticleDto) {
    return this.publicationsService.scheduleArticle(id, dto);
  }
}

