import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageService } from './local-storage.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('LocalStorageService - Path Traversal & Security', () => {
  let service: LocalStorageService;
  const testKey = 'articles/test-article/manuscript-test.pdf';
  const testContent = Buffer.from('%PDF-1.4 dummy pdf test content');

  beforeEach(() => {
    service = new LocalStorageService();
  });

  afterEach(() => {
    // Clean up created test file if exists
    const safePath = path.resolve(process.cwd(), 'uploads', testKey);
    if (fs.existsSync(safePath)) {
      fs.unlinkSync(safePath);
      // clean up directory if empty
      const dir = path.dirname(safePath);
      if (fs.existsSync(dir)) {
        try {
          fs.rmdirSync(dir);
        } catch (_) {}
      }
    }
  });

  describe('Valid keys', () => {
    it('should successfully upload and stream a file with a valid relative key', async () => {
      const uploadedKey = await service.uploadLocalFile(testKey, testContent);
      expect(uploadedKey).toBe(testKey);

      const streamable = await service.getLocalFileStream(testKey);
      expect(streamable).toBeDefined();
      
      // Read stream to completion to safely close file handle
      const stream = streamable.getStream();
      await new Promise((resolve) => {
        stream.on('data', () => {});
        stream.on('end', resolve);
        stream.on('close', resolve);
      });
    });
  });

  describe('Path Traversal & Malicious keys rejection', () => {
    it('should reject relative path traversal ../', async () => {
      await expect(
        service.uploadLocalFile('../outside.txt', Buffer.from('exploit'))
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getLocalFileStream('../outside.txt')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject nested traversal like articles/../../outside.txt', async () => {
      await expect(
        service.uploadLocalFile('articles/../../etc/passwd', Buffer.from('exploit'))
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getLocalFileStream('articles/../../etc/passwd')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject empty or non-string key', async () => {
      await expect(
        service.uploadLocalFile('', Buffer.from('empty key'))
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getLocalFileStream('')
      ).rejects.toThrow(BadRequestException);
    });

    it('should return NotFoundException when valid key does not exist on disk', async () => {
      await expect(
        service.getLocalFileStream('articles/non-existent-uuid/file.pdf')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
