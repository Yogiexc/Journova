import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ArticleStatus, EditorialFileStage } from '@prisma/client';
import { ScheduleArticleDto } from './dto/publication.dto.js';
import { Express } from 'express';

@Injectable()
export class PublicationsService {
  constructor(private prisma: PrismaService) {}

  async getPublicationQueue() {
    return this.prisma.article.findMany({
      where: {
        status: {
          in: ['ACCEPTED', 'COPYEDITING', 'PRODUCTION', 'SCHEDULED']
        }
      },
      include: {
        authors: {
          include: { author: true },
          orderBy: { author_order: 'asc' }
        },
        issue: true,
        editorial_files: {
          orderBy: { created_at: 'desc' }
        },
        publications: true
      },
      orderBy: { updated_at: 'desc' }
    });
  }

  async getPublicationDetail(articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        authors: {
          include: { author: true },
          orderBy: { author_order: 'asc' }
        },
        issue: true,
        editorial_files: {
          include: {
            uploader: { select: { id: true, name: true, email: true } },
            file: true
          },
          orderBy: { created_at: 'desc' }
        },
        publications: {
          include: { file: true }
        }
      }
    });

    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async startCopyediting(articleId: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');
    if (article.status !== 'ACCEPTED') throw new BadRequestException('Article must be ACCEPTED to start copyediting');

    return this.prisma.article.update({
      where: { id: articleId },
      data: { status: 'COPYEDITING' }
    });
  }

  async startProduction(articleId: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');
    if (article.status !== 'COPYEDITING') throw new BadRequestException('Article must be COPYEDITING to start production');

    return this.prisma.article.update({
      where: { id: articleId },
      data: { status: 'PRODUCTION' }
    });
  }

  async uploadEditorialFile(articleId: string, userId: string, fileData: any, stage: EditorialFileStage, notes?: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');
    
    if (stage === 'COPYEDIT' && article.status !== 'COPYEDITING') {
      throw new BadRequestException('Can only upload copyedit files when article is COPYEDITING');
    }
    if ((stage === 'PROOF' || stage === 'PRODUCTION') && article.status !== 'PRODUCTION') {
      throw new BadRequestException('Can only upload production files when article is PRODUCTION');
    }

    // Determine version number
    const existingFiles = await this.prisma.editorialFile.findMany({
      where: { article_id: articleId, stage }
    });
    const version = existingFiles.length + 1;

    // Create file record
    // Mocking file upload in MVP logic
    return this.prisma.$transaction(async (tx: any) => {
      const file = await tx.file.create({
        data: {
          storage_provider: 'local',
          storage_key: fileData.filename || 'mock-key',
          original_name: fileData.originalname || 'mock-file.pdf',
          mime_type: fileData.mimetype || 'application/pdf',
          size: fileData.size || 1024,
          uploaded_by: userId
        }
      });

      return tx.editorialFile.create({
        data: {
          article_id: articleId,
          uploaded_by: userId,
          stage,
          file_id: file.id,
          version,
          notes
        },
        include: {
          file: true,
          uploader: { select: { name: true } }
        }
      });
    });
  }

  async scheduleArticle(articleId: string, dto: ScheduleArticleDto) {
    const { issue_id, page_start, page_end } = dto;
    
    if (page_start < 1) throw new BadRequestException('Page start must be >= 1');
    if (page_end < page_start) throw new BadRequestException('Page end must be >= page start');

    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        editorial_files: {
          where: { stage: 'PRODUCTION' },
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!article) throw new NotFoundException('Article not found');
    if (article.status !== 'PRODUCTION') throw new BadRequestException('Article must be in PRODUCTION to be scheduled');
    
    const productionFiles = article.editorial_files;
    if (!productionFiles || productionFiles.length === 0) {
      throw new BadRequestException('Final production file must exist before scheduling');
    }

    const issue = await this.prisma.issue.findUnique({ where: { id: issue_id } });
    if (!issue) throw new NotFoundException('Issue not found');
    if (issue.status === 'PUBLISHED') throw new BadRequestException('Cannot schedule to a published issue');

    // Check overlap
    const scheduledArticles = await this.prisma.article.findMany({
      where: { 
        issue_id, 
        id: { not: articleId },
        status: 'SCHEDULED' 
      },
      select: { page_start: true, page_end: true }
    });

    for (const sa of scheduledArticles) {
      if (sa.page_start && sa.page_end) {
        if (!(page_end < sa.page_start || page_start > sa.page_end)) {
          throw new ConflictException(`Page range overlaps with another article in this issue (Pages ${sa.page_start}-${sa.page_end})`);
        }
      }
    }

    return this.prisma.$transaction(async (tx: any) => {
      // Create PublicationRecord
      const pubRecord = await tx.publicationRecord.create({
        data: {
          article_id: articleId,
          issue_id: issue_id,
          file_id: productionFiles[0].file_id,
          version: 1, // First published version
          page_start,
          page_end
        }
      });

      // Update Article
      await tx.article.update({
        where: { id: articleId },
        data: {
          status: 'SCHEDULED',
          issue_id,
          page_start,
          page_end
        }
      });

      return pubRecord;
    });
  }
}

