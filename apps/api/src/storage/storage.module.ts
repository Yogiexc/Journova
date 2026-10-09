import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { LocalStorageService } from './local-storage.service.js';
import { R2StorageService } from './r2-storage.service.js';
import { StorageResolverService } from './storage-resolver.service.js';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageService,
    R2StorageService,
    {
      provide: StorageService,
      useClass: StorageResolverService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
