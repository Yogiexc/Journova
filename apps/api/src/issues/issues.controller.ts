import { Controller, Get, Query, Param } from '@nestjs/common';
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
}
