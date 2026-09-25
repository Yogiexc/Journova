import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ArticleQueryDto } from './dto/article-query.dto.js';
import { Prisma } from '@prisma/client';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // Consistent public author selection
  private readonly publicAuthorSelect = {
    author: {
      select: {
        id: true,
        full_name: true,
        affiliation: true,
        institution: true,
        country: true,
        orcid: true,
      },
    },
    is_corresponding: true,
    author_order: true,
  };

  async findPublished(query: ArticleQueryDto) {
    const { page = 1, limit = 10, search, issue_id, category_id, keyword, year, sort } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {
      status: 'PUBLISHED',
      issue: {
        status: 'PUBLISHED',
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (issue_id) {
      where.issue_id = issue_id;
    }

    if (category_id) {
      where.categories = {
        some: { category_id },
      };
    }

    if (keyword) {
      where.keywords = {
        some: {
          keyword: { name: { contains: keyword, mode: 'insensitive' } },
        },
      };
    }

    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      where.published_at = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Sort definition
    let orderBy: Prisma.ArticleOrderByWithRelationInput = { published_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { published_at: 'asc' };
    } else if (sort === 'title') {
      orderBy = { title: 'asc' };
    }

    const [total, data] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          abstract: true,
          published_at: true,
          doi: true,
          authors: {
            select: this.publicAuthorSelect,
            orderBy: { author_order: 'asc' },
          },
          issue: {
            select: {
              id: true,
              issue_number: true,
              volume: {
                select: {
                  volume_number: true,
                  year: true,
                }
              }
            }
          }
        },
      }),
    ]);

    const total_pages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        total_pages,
      },
    };
  }

  async findOneBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        issue: {
          status: 'PUBLISHED',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        abstract: true,
        published_at: true,
        doi: true,
        page_start: true,
        page_end: true,
        authors: {
          select: this.publicAuthorSelect,
          orderBy: { author_order: 'asc' },
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        keywords: {
          select: {
            keyword: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        issue: {
          select: {
            id: true,
            title: true,
            issue_number: true,
            volume: {
              select: {
                volume_number: true,
                year: true,
              }
            }
          }
        },
        // IMPORTANT: We do not expose the raw 'File' model
        // We only mock the public URL logic. The actual file URL logic will be in Phase 7
        publications: {
          select: {
            id: true
          }
        }
      },
    });

    if (!article) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'ARTICLE_NOT_FOUND',
          message: 'Article not found'
        }
      });
    }

    // Format the response slightly to be more frontend friendly, e.g. mapping pdf_url
    const formattedData = {
      ...article,
      pdf_url: article.publications && article.publications.length > 0 ? `/api/v1/articles/${article.slug}/pdf` : null,
      publications: undefined // remove the internal object
    };

    return {
      success: true,
      data: formattedData
    };
  }

  async downloadPdf(slug: string): Promise<StreamableFile> {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        issue: {
          status: 'PUBLISHED',
        },
      },
      include: {
        publications: {
          include: {
            file: true,
          }
        }
      }
    });

    if (!article) {
      throw new NotFoundException('Article not found or not published');
    }

    if (!article.publications || article.publications.length === 0) {
      throw new NotFoundException('Publication record not found');
    }

    const pubRecord = article.publications[0];
    const fileRecord = pubRecord.file;

    if (!fileRecord || !fileRecord.storage_key) {
      throw new NotFoundException('PDF file is missing');
    }

    return this.storageService.getFileStream(fileRecord.storage_key);
  }
}
