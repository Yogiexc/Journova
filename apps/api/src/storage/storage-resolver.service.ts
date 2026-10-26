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
      try {
        return await this.localService.getLocalFileStream(key);
      } catch (e) {
        // Return a valid minimal PDF buffer for mock published articles so browser preview works reliably
        const minimalPdf = Buffer.from(
          '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
        );
        return new StreamableFile(minimalPdf);
      }
    }

    throw new InternalServerErrorException(`Unknown storage provider: ${provider}`);
  }
}
