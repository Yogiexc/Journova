import { Module } from '@nestjs/common';
import { EditorController } from './editor.controller.js';
import { EditorService } from './editor.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EditorController],
  providers: [EditorService],
})
export class EditorModule {}
