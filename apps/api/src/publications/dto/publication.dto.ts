import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EditorialFileStage } from '@prisma/client';

export class UploadEditorialFileDto {
  @IsString()
  @IsNotEmpty()
  stage: EditorialFileStage;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ScheduleArticleDto {
  @IsString()
  @IsNotEmpty()
  issue_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page_start: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page_end: number;
}
