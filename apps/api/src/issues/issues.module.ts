import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service.js';
import { IssuesController } from './issues.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [IssuesService],
  controllers: [IssuesController]
})
export class IssuesModule {}
