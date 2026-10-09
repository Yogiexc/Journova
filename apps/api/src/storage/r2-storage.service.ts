import { Injectable, InternalServerErrorException, NotFoundException, StreamableFile, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import type { Readable } from 'stream';

@Injectable()
export class R2StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(R2StorageService.name);

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'journova-storage';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      this.logger.warn('Cloudflare R2 credentials are not fully configured. R2 File operations will fail.');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async uploadR2File(key: string, fileData: Buffer): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileData,
      });

      await this.s3Client.send(command);
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key} to R2`, error);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  async getR2FileStream(key: string): Promise<StreamableFile> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new NotFoundException('File stream is empty');
      }

      const stream = response.Body as unknown as Readable;
      return new StreamableFile(stream);
    } catch (error: any) {
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException('File not found in storage');
      }
      this.logger.error(`Failed to get file stream for ${key}`, error);
      throw new InternalServerErrorException('Failed to retrieve file from storage');
    }
  }
}
