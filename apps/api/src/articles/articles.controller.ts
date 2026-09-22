import { Controller, Get, Query, Param, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get(':slug/pdf')
  async getPdf(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const fileStream = await this.articlesService.downloadPdf(slug);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${slug}.pdf"`,
    });
    
    return fileStream;
  }
}
