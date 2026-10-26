import { describe, beforeEach, it, expect, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PublicationsService } from './publications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { BadRequestException } from '@nestjs/common';
import { EditorialFileStage } from '@prisma/client';

describe('PublicationsService (Isolated Storage & PDF Binary Validation)', () => {
  let service: PublicationsService;
  let prismaMock: any;
  let storageMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: vi.fn((callback) => callback(prismaMock)),
      file: {
        create: vi.fn().mockResolvedValue({ id: 'mock-file-id' }),
      },
      editorialFile: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({
          id: 'mock-editorial-file-id',
          article_id: 'art-123',
          stage: EditorialFileStage.COPYEDITING,
          version: 1,
        }),
      },
      article: {
        findMany: vi.fn(),
        findUnique: vi.fn().mockResolvedValue({
          id: 'art-123',
          status: 'COPYEDITING',
        }),
      },
    };

    storageMock = {
      uploadFile: vi.fn().mockResolvedValue({
        key: 'articles/art-123/copyediting-mock-uuid.pdf',
        provider: 'local',
      }),
      getFileStream: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicationsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();

    service = module.get<PublicationsService>(PublicationsService);
  });

  it('P0-1: should successfully validate and upload a valid PDF file with %PDF- header', async () => {
    const validPdfBuffer = Buffer.from('%PDF-1.4\n%Valid Minimal PDF Content for test');
    const mockFile: any = {
      originalname: 'manuscript.pdf',
      mimetype: 'application/pdf',
      size: validPdfBuffer.length,
      buffer: validPdfBuffer,
    };

    const result = await service.uploadEditorialFile(
      'art-123',
      'user-editor-1',
      mockFile,
      'COPYEDIT' as any,
      'Initial galley proof',
    );

    expect(storageMock.uploadFile).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.id).toBe('mock-editorial-file-id');
  });

  it('P0-2: should reject a text file renamed to .pdf (invalid magic bytes)', async () => {
    const fakePdfBuffer = Buffer.from('This is actually a plain text file pretending to be PDF');
    const mockFile: any = {
      originalname: 'malicious.pdf',
      mimetype: 'application/pdf',
      size: fakePdfBuffer.length,
      buffer: fakePdfBuffer,
    };

    await expect(
      service.uploadEditorialFile(
        'art-123',
        'user-editor-1',
        mockFile,
        EditorialFileStage.COPYEDITING,
      ),
    ).rejects.toThrow(new BadRequestException('File is not a valid PDF'));

    expect(storageMock.uploadFile).not.toHaveBeenCalled();
  });

  it('P0-3: should reject an empty 0-byte file', async () => {
    const emptyBuffer = Buffer.alloc(0);
    const mockFile: any = {
      originalname: 'empty.pdf',
      mimetype: 'application/pdf',
      size: 0,
      buffer: emptyBuffer,
    };

    await expect(
      service.uploadEditorialFile(
        'art-123',
        'user-editor-1',
        mockFile,
        EditorialFileStage.COPYEDITING,
      ),
    ).rejects.toThrow(new BadRequestException('File is empty'));

    expect(storageMock.uploadFile).not.toHaveBeenCalled();
  });

  it('P0-4: should reject a non-PDF mime type even if extension is .pdf', async () => {
    const validBuffer = Buffer.from('%PDF-1.4\nSome Content');
    const mockFile: any = {
      originalname: 'document.pdf',
      mimetype: 'image/png',
      size: validBuffer.length,
      buffer: validBuffer,
    };

    await expect(
      service.uploadEditorialFile(
        'art-123',
        'user-editor-1',
        mockFile,
        EditorialFileStage.COPYEDITING,
      ),
    ).rejects.toThrow(new BadRequestException('Only PDF files are allowed'));

    expect(storageMock.uploadFile).not.toHaveBeenCalled();
  });
});
