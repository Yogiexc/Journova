import { Module } from '@nestjs/common';
import { DoiService } from './doi.service.js';
import { DoiController } from './doi.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DoiController],
  providers: [DoiService],
  exports: [DoiService],
})
export class DoiModule {}
