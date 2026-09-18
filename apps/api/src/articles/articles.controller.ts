import { Controller, Get, Query, Param } from '@nestjs/common';
import { ArticlesService } from './articles.service.js';
import { ArticleQueryDto } from './dto/article-query.dto.js';

@Controller('api/v1/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findPublished(@Query() query: ArticleQueryDto) {
    return this.articlesService.findPublished(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.articlesService.findOneBySlug(slug);
  }
}
