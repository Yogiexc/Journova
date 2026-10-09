import { Injectable, StreamableFile } from '@nestjs/common';

export interface UploadResult {
  key: string;
  provider: string;
}

export abstract class StorageService {
  /**
   * Uploads a file to the configured write storage provider.
   * @param key The unique key/path for the file
   * @param fileData The file buffer to upload
   * @returns An object containing the fully qualified URL or path reference and the provider used
   */
  abstract uploadFile(key: string, fileData: Buffer): Promise<UploadResult>;

  /**
   * Reads a file from the storage provider as a stream based on where it was actually saved.
   * @param key The unique key/path for the file
   * @param provider The storage provider to read from ('local', 'r2', 'mock', etc.)
   * @returns StreamableFile
   */
  abstract getFileStream(key: string, provider: string): Promise<StreamableFile>;
}
