import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  abstract?: string;

  @IsUUID()
  journal_id: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
