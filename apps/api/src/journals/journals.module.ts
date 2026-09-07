import { Module } from '@nestjs/common';
import { JournalsService } from './journals.service.js';
import { JournalsController } from './journals.controller.js';

@Module({
  controllers: [JournalsController],
  providers: [JournalsService],
})
export class JournalsModule {}
