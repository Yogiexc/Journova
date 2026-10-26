import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { UsersService } from '../src/users/users.service.js';
import { LocalStorageService } from '../src/storage/local-storage.service.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor.js';

describe('Publications Upload Multipart HTTP Integration Test (e2e)', () => {
  let app: INestApplication | undefined;
  let jwtService: JwtService;
  let editorToken: string;
  let authorToken: string;

  // Preserve original environment variables for safe restoration
  const originalEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  };

  const testArticleId = 'test-article-uuid-1234';
  const editorUserId = 'test-editor-user-id';
  const authorUserId = 'test-author-user-id';

  // Dedicated test staging storage directory completely isolated from standard uploads
  const testStorageDir = path.resolve(process.cwd(), 'uploads', 'staging_e2e_isolated');
  const uploadedFilePaths: string[] = [];

  // Subclassed LocalStorageService that targets the dedicated staging folder
  class IsolatedTestLocalStorageService extends LocalStorageService {
    override get uploadDir(): string {
      return testStorageDir;
    }
  }

  // Mock Prisma Service ensuring 0 calls reach any remote database
  const mockPrismaService = {
    $connect: async () => {},
    $disconnect: async () => {},
    $transaction: async (cb: (tx: any) => Promise<any>) => {
      const mockTx = {
        file: {
          create: async ({ data }: any) => ({
            id: 'mock-file-id-5678',
            ...data,
            created_at: new Date(),
          }),
        },
        editorialFile: {
          create: async ({ data }: any) => ({
            id: 'mock-editorial-file-id-9012',
            ...data,
            created_at: new Date(),
            file: {
              id: 'mock-file-id-5678',
              storage_provider: 'local',
              storage_key: data.storage_key || `articles/${testArticleId}/copyedit-dummy.pdf`,
              original_name: 'test-manuscript.pdf',
              mime_type: 'application/pdf',
              size: 100,
            },
            uploader: { name: 'Test Editor' },
          }),
        },
      };
      return cb(mockTx);
    },
    article: {
      findUnique: async ({ where }: any) => {
        if (where.id === testArticleId) {
          return {
            id: testArticleId,
            title: 'Test Integration Article',
            status: 'COPYEDITING',
          };
        }
        return null;
      },
    },
    editorialFile: {
      findMany: async () => [],
    },
  };

  // Mock UsersService for JWT Strategy validation
  const mockUsersService = {
    findOne: async (id: string) => {
      if (id === editorUserId) {
        return {
          id: editorUserId,
          email: 'editor@journova.test',
          name: 'Test Editor',
          roles: [{ role: { name: 'EDITOR' } }],
        };
      }
      if (id === authorUserId) {
        return {
          id: authorUserId,
          email: 'author@journova.test',
          name: 'Test Author',
          roles: [{ role: { name: 'AUTHOR' } }],
        };
      }
      return null;
    },
  };

  beforeAll(async () => {
    // 1. Isolate environment variables
    process.env.DATABASE_URL = 'postgresql://isolated_test_user:isolated_test_pw@localhost:5432/journova_isolated_test';
    process.env.NODE_ENV = 'test';
    process.env.STORAGE_PROVIDER = 'local';

    // 2. Ensure staging storage directory is clean before tests start
    if (fs.existsSync(testStorageDir)) {
      fs.rmSync(testStorageDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testStorageDir, { recursive: true });

    // 3. Build Testing Module with isolated providers
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(LocalStorageService)
      .useClass(IsolatedTestLocalStorageService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Replicate production filters, pipes, and interceptors
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    // 4. Generate authentic JWT tokens signed by the Nest JWT secret
    jwtService = moduleFixture.get<JwtService>(JwtService);
    editorToken = jwtService.sign({ sub: editorUserId, email: 'editor@journova.test' });
    authorToken = jwtService.sign({ sub: authorUserId, email: 'author@journova.test' });
  });

  afterAll(async () => {
    // 1. Close application instance
    if (app) {
      await app.close();
    }

    // 2. Precise granular cleanup: unlink all files tracked during tests
    for (const filePath of uploadedFilePaths) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }

    // Remove the isolated test directory safely
    if (fs.existsSync(testStorageDir)) {
      try {
        fs.rmSync(testStorageDir, { recursive: true, force: true });
      } catch (_) {}
    }

    // 3. Restore all original environment variables
    for (const [key, val] of Object.entries(originalEnv)) {
      if (val === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = val;
      }
    }
  });

  it('1. Rejects request without token with HTTP 401 Unauthorized', async () => {
    const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');

    const res = await request(app!.getHttpServer())
      .post(`/api/v1/editor/publications/${testArticleId}/files`)
      .attach('file', validPdfBuffer, 'sample.pdf')
      .field('stage', 'COPYEDIT');

    expect(res.status).toBe(401);
  });

  it('2. Rejects request from non-EDITOR role (AUTHOR) with HTTP 403 Forbidden', async () => {
    const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');

    const res = await request(app!.getHttpServer())
      .post(`/api/v1/editor/publications/${testArticleId}/files`)
      .set('Authorization', `Bearer ${authorToken}`)
      .attach('file', validPdfBuffer, 'sample.pdf')
      .field('stage', 'COPYEDIT');

    expect(res.status).toBe(403);
  });

  it('3. Rejects empty file (0-byte) with HTTP 400 Bad Request', async () => {
    const emptyBuffer = Buffer.alloc(0);

    const res = await request(app!.getHttpServer())
      .post(`/api/v1/editor/publications/${testArticleId}/files`)
      .set('Authorization', `Bearer ${editorToken}`)
      .attach('file', emptyBuffer, 'empty.pdf')
      .field('stage', 'COPYEDIT');

    expect(res.status).toBe(400);
    expect(res.body.error?.message || res.body.message).toMatch(/empty/i);
  });

  it('4. Rejects spoofed text file (.txt pretending to be .pdf) with HTTP 400 Bad Request', async () => {
    const textBuffer = Buffer.from('Plain text file masquerading as a PDF document');

    const res = await request(app!.getHttpServer())
      .post(`/api/v1/editor/publications/${testArticleId}/files`)
      .set('Authorization', `Bearer ${editorToken}`)
      .attach('file', textBuffer, 'spoofed.pdf')
      .field('stage', 'COPYEDIT');

    expect(res.status).toBe(400);
    expect(res.body.error?.message || res.body.message).toMatch(/not a valid PDF/i);
  });

  it('5. Accepts valid PDF binary with %PDF- header, writes file to disk, and returns HTTP 201', async () => {
    const validPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n173\n%%EOF'
    );

    const res = await request(app!.getHttpServer())
      .post(`/api/v1/editor/publications/${testArticleId}/files`)
      .set('Authorization', `Bearer ${editorToken}`)
      .attach('file', validPdfBuffer, 'authentic-article.pdf')
      .field('stage', 'COPYEDIT')
      .field('notes', 'Integration test upload');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    // Verify storage in isolated test staging directory
    const testArticleUploadDir = path.resolve(testStorageDir, 'articles', testArticleId);
    expect(fs.existsSync(testArticleUploadDir)).toBe(true);

    const savedFiles = fs.readdirSync(testArticleUploadDir);
    expect(savedFiles.length).toBe(1);
    expect(savedFiles[0]).toMatch(/^copyedit-.*\.pdf$/);

    const savedFilePath = path.resolve(testArticleUploadDir, savedFiles[0]);
    uploadedFilePaths.push(savedFilePath);

    const savedBuffer = fs.readFileSync(savedFilePath);
    expect(savedBuffer.equals(validPdfBuffer)).toBe(true);
  });
});
