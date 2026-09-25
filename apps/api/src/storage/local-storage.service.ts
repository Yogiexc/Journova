import { Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService implements StorageService {
  private get uploadDir(): string {
    return path.join(process.cwd(), 'uploads');
  }

  async uploadFile(key: string, fileData: Buffer): Promise<string> {
    try {
      const filePath = path.join(this.uploadDir, key);
      // Validate path traversal
      if (!filePath.startsWith(this.uploadDir)) {
        throw new Error('Invalid file path');
      }

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, fileData);
      
      return key; // For local storage, the key is sufficient
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file to local storage');
    }
  }

  async getFileStream(key: string): Promise<StreamableFile> {
    const filePath = path.join(this.uploadDir, key);
    
    // Validate path traversal
    if (!filePath.startsWith(this.uploadDir)) {
      throw new NotFoundException('File not found');
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = fs.createReadStream(filePath);
    return new StreamableFile(fileStream);
  }
}
