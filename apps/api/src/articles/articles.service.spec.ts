import { describe, beforeEach, it, expect, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { NotFoundException, StreamableFile } from '@nestjs/common';

describe('ArticlesService (Public PDF Access Boundary & Unreleased Protection)', () => {
  let service: ArticlesService;
  let prismaMock: any;
  let storageMock: any;

  beforeEach(async () => {
    prismaMock = {
      article: {
        findFirst: vi.fn(),
      },
    };

    storageMock = {
      getFileStream: vi.fn().mockResolvedValue(new StreamableFile(Buffer.from('%PDF-1.4\nTest Stream'))),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('P1-1: should successfully stream PDF for published article in a published issue', async () => {
    prismaMock.article.findFirst.mockResolvedValue({
      id: 'art-published-1',
      slug: 'valid-published-slug',
      status: 'PUBLISHED',
      publications: [
        {
          file: {
            storage_key: 'articles/art-published-1/proof.pdf',
            storage_provider: 'local',
          },
        },
      ],
    });

    const stream = await service.downloadPdf('valid-published-slug');
    expect(stream).toBeDefined();
    expect(storageMock.getFileStream).toHaveBeenCalledWith(
      'articles/art-published-1/proof.pdf',
      'local',
    );
  });

  it('P1-2: should reject download with 404 for draft or unpublished article', async () => {
    // When article is DRAFT or ACCEPTED, prisma findFirst returns null because of status: 'PUBLISHED' filter
    prismaMock.article.findFirst.mockResolvedValue(null);

    await expect(service.downloadPdf('draft-article-slug')).rejects.toThrow(
      new NotFoundException('Article not found or not published'),
    );

    expect(storageMock.getFileStream).not.toHaveBeenCalled();
  });

  it('P1-3: should reject download with 404 if publication record or PDF file is missing', async () => {
    prismaMock.article.findFirst.mockResolvedValue({
      id: 'art-published-2',
      slug: 'no-file-slug',
      status: 'PUBLISHED',
      publications: [], // No publication record
    });

    await expect(service.downloadPdf('no-file-slug')).rejects.toThrow(
      new NotFoundException('Publication record not found'),
    );

    expect(storageMock.getFileStream).not.toHaveBeenCalled();
  });
});
