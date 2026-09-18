import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service.js';
import { IssuesController } from './issues.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [IssuesService],
  controllers: [IssuesController]
})
export class IssuesModule {}
