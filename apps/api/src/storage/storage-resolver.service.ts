import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StorageService, UploadResult } from './storage.service.js';
import { LocalStorageService } from './local-storage.service.js';
import { R2StorageService } from './r2-storage.service.js';
import { ConfigService } from '@nestjs/config';
import { StreamableFile } from '@nestjs/common';

@Injectable()
export class StorageResolverService implements StorageService {
  constructor(
    private readonly localService: LocalStorageService,
    private readonly r2Service: R2StorageService,
    private readonly configService: ConfigService,
  ) {}

  private getWriteProvider(): string {
    return this.configService.get<string>('STORAGE_PROVIDER') === 'r2' ? 'r2' : 'local';
  }

  async uploadFile(key: string, fileData: Buffer): Promise<UploadResult> {
    const provider = this.getWriteProvider();
    
    if (provider === 'r2') {
      const resultKey = await this.r2Service.uploadR2File(key, fileData);
      return { key: resultKey, provider: 'r2' };
    }
    
    // Default to local
    const resultKey = await this.localService.uploadLocalFile(key, fileData);
    return { key: resultKey, provider: 'local' };
  }

  async getFileStream(key: string, provider: string): Promise<StreamableFile> {
    if (provider === 'r2') {
      return this.r2Service.getR2FileStream(key);
    }
    
    if (provider === 'local') {
      return this.localService.getLocalFileStream(key);
    }

    if (provider === 'mock') {
      // For mock submissions, we can fallback to local if file exists, or just throw
      // In this demo, we'll try local.
      try {
        return await this.localService.getLocalFileStream(key);
      } catch (e) {
         throw new InternalServerErrorException(`File not found for mock provider or mock file missing`);
      }
    }

    throw new InternalServerErrorException(`Unknown storage provider: ${provider}`);
  }
}
