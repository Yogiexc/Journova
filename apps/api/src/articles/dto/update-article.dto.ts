import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto.js';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
