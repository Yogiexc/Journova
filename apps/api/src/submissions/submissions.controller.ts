import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SubmissionsService } from './submissions.service.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { UploadVersionDto } from './dto/upload-version.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('api/v1/submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Request() req: any, @Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.create(req.user.id, createSubmissionDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.submissionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.submissionsService.findOne(req.user.id, id);
  }

  @Post(':id/versions')
  uploadVersion(
    @Request() req: any,
    @Param('id') id: string,
    @Body() uploadVersionDto: UploadVersionDto
  ) {
    return this.submissionsService.uploadVersion(req.user.id, id, uploadVersionDto);
  }

  @Post(':id/submit')
  submit(@Request() req: any, @Param('id') id: string) {
    return this.submissionsService.submit(req.user.id, id);
  }
}
