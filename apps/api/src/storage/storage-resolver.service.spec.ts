import { describe, beforeEach, it, expect, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageResolverService } from './storage-resolver.service.js';
import { LocalStorageService } from './local-storage.service.js';
import { R2StorageService } from './r2-storage.service.js';
import { ConfigService } from '@nestjs/config';
import { StreamableFile } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';

describe('StorageResolverService', () => {
  let resolver: StorageResolverService;
  let localService: LocalStorageService;
  let r2Service: R2StorageService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageResolverService,
        {
          provide: LocalStorageService,
          useValue: {
            uploadLocalFile: vi.fn(),
            getLocalFileStream: vi.fn(),
          },
        },
        {
          provide: R2StorageService,
          useValue: {
            uploadR2File: vi.fn(),
            getR2FileStream: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<StorageResolverService>(StorageResolverService);
    localService = module.get<LocalStorageService>(LocalStorageService);
    r2Service = module.get<R2StorageService>(R2StorageService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('uploadFile', () => {
    it('should use LocalStorageService when STORAGE_PROVIDER is local', async () => {
      vi.spyOn(configService, 'get').mockReturnValue('local');
      vi.spyOn(localService, 'uploadLocalFile').mockResolvedValue('test-key');

      const result = await resolver.uploadFile('test-key', Buffer.from('test'));

      expect(result).toEqual({ key: 'test-key', provider: 'local' });
      expect(localService.uploadLocalFile).toHaveBeenCalledWith('test-key', Buffer.from('test'));
      expect(r2Service.uploadR2File).not.toHaveBeenCalled();
    });

    it('should use R2StorageService when STORAGE_PROVIDER is r2', async () => {
      vi.spyOn(configService, 'get').mockReturnValue('r2');
      vi.spyOn(r2Service, 'uploadR2File').mockResolvedValue('test-key');

      const result = await resolver.uploadFile('test-key', Buffer.from('test'));

      expect(result).toEqual({ key: 'test-key', provider: 'r2' });
      expect(r2Service.uploadR2File).toHaveBeenCalledWith('test-key', Buffer.from('test'));
      expect(localService.uploadLocalFile).not.toHaveBeenCalled();
    });
  });

  describe('getFileStream', () => {
    it('should route to LocalStorageService when provider is local', async () => {
      const mockStream = new StreamableFile(Buffer.from(''));
      vi.spyOn(localService, 'getLocalFileStream').mockResolvedValue(mockStream);

      const result = await resolver.getFileStream('test-key', 'local');

      expect(result).toBe(mockStream);
      expect(localService.getLocalFileStream).toHaveBeenCalledWith('test-key');
    });

    it('should route to R2StorageService when provider is r2', async () => {
      const mockStream = new StreamableFile(Buffer.from(''));
      vi.spyOn(r2Service, 'getR2FileStream').mockResolvedValue(mockStream);

      const result = await resolver.getFileStream('test-key', 'r2');

      expect(result).toBe(mockStream);
      expect(r2Service.getR2FileStream).toHaveBeenCalledWith('test-key');
    });

    it('should route mock to local or throw', async () => {
      const mockStream = new StreamableFile(Buffer.from(''));
      vi.spyOn(localService, 'getLocalFileStream').mockResolvedValue(mockStream);

      const result = await resolver.getFileStream('test-key', 'mock');

      expect(result).toBe(mockStream);
    });

    it('should throw InternalServerErrorException for unknown provider', async () => {
      await expect(resolver.getFileStream('test-key', 'unknown')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
