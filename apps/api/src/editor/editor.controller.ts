import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { EditorService } from './editor.service.js';
import { AssignReviewerDto } from './dto/assign-reviewer.dto.js';
import { EditorialDecisionDto } from './dto/editorial-decision.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('api/v1/editor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EDITOR')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Get('submissions')
  findAll() {
    return this.editorService.findAll();
  }

  @Get('submissions/:id')
  findOne(@Param('id') id: string) {
    return this.editorService.findOne(id);
  }

  @Post('submissions/:id/reviewers')
  assignReviewer(
    @Param('id') id: string,
    @Body() dto: AssignReviewerDto,
    @Request() req: any,
  ) {
    return this.editorService.assignReviewer(id, dto, req.user.id);
  }

  @Post('submissions/:id/decision')
  makeDecision(
    @Param('id') id: string,
    @Body() dto: EditorialDecisionDto,
    @Request() req: any,
  ) {
    return this.editorService.makeDecision(id, dto, req.user.id);
  }

  @Patch('submissions/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.editorService.updateStatus(id, dto);
  }
}
