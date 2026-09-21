import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { JournalsModule } from './journals/journals.module.js';
import { ArticlesModule } from './articles/articles.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { HealthModule } from './health/health.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { IssuesModule } from './issues/issues.module.js';
import { EditorModule } from './editor/editor.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10, // Max 10 requests per minute by default
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    JournalsModule,
    ArticlesModule,
    SubmissionsModule,
    ReviewsModule,
    HealthModule,
    IssuesModule,
    EditorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
