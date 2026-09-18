import { IsOptional, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class ArticleQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  issue_id?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsString()
  sort?: string; // e.g. 'latest'
}
