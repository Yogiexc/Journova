import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { LocalStorageService } from './local-storage.service.js';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: StorageService,
      useClass: LocalStorageService, // Future proof: this can be conditionally set to S3StorageService based on config
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
