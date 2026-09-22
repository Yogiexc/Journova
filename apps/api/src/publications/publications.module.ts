import { Module } from '@nestjs/common';
import { PublicationsController } from './publications.controller.js';
import { PublicationsService } from './publications.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PublicationsController],
  providers: [PublicationsService]
})
export class PublicationsModule {}
