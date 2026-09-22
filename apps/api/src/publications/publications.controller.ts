import { Controller, Get, Post, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UploadEditorialFileDto,
    @UploadedFile() file: any
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.publicationsService.uploadEditorialFile(id, req.user.id, file, dto.stage, dto.notes);
  }

  @Post(':id/schedule')
  schedule(@Param('id') id: string, @Body() dto: ScheduleArticleDto) {
    return this.publicationsService.scheduleArticle(id, dto);
  }
}

