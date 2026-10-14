import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  private get uploadDir(): string {
    return path.resolve(process.cwd(), 'uploads');
  }

  private resolveSafePath(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new BadRequestException('Invalid file key');
    }

    const baseDir = this.uploadDir;
    const resolvedPath = path.resolve(baseDir, key);
    const relative = path.relative(baseDir, resolvedPath);

    // Prevent path traversal outside baseDir (e.g. ../ or absolute escape or prefix collision)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new BadRequestException('Invalid file key or path traversal detected');
    }

    return resolvedPath;
  }

  async uploadLocalFile(key: string, fileData: Buffer): Promise<string> {
    try {
      const filePath = this.resolveSafePath(key);

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, fileData);
      
      return key; // For local storage, the key is sufficient
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file to local storage');
    }
  }

  async getLocalFileStream(key: string): Promise<StreamableFile> {
    const filePath = this.resolveSafePath(key);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = fs.createReadStream(filePath);
    return new StreamableFile(fileStream);
  }
}
