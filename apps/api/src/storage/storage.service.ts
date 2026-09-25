import { Injectable, StreamableFile } from '@nestjs/common';

export abstract class StorageService {
  /**
   * Uploads a file to the storage provider.
   * @param key The unique key/path for the file
   * @param fileData The file buffer to upload
   * @returns The fully qualified URL or path reference
   */
  abstract uploadFile(key: string, fileData: Buffer): Promise<string>;

  /**
   * Reads a file from the storage provider as a stream.
   * @param key The unique key/path for the file
   * @returns StreamableFile
   */
  abstract getFileStream(key: string): Promise<StreamableFile>;
}
