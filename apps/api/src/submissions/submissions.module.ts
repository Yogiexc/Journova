import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service.js';
import { SubmissionsController } from './submissions.controller.js';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
