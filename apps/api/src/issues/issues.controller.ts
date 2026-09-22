import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { IssuesService } from './issues.service.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Controller('api/v1/issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  findPublished(@Query() query: PaginationDto) {
    return this.issuesService.findPublished(query);
  }

  @Get('latest')
  findLatest() {
    return this.issuesService.findLatest();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Get('editor/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  findEditorIssues() {
    return this.issuesService.findEditorIssues();
  }

  @Post('editor/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  publishIssue(@Param('id') id: string) {
    return this.issuesService.publishIssue(id);
  }
}
