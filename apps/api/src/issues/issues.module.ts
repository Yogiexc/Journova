import { Module, forwardRef } from '@nestjs/common';
import { IssuesService } from './issues.service.js';
import { IssuesController } from './issues.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DoiModule } from '../doi/doi.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule, DoiModule],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService]
})
export class IssuesModule {}
