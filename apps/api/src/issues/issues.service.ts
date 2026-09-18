import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(query: PaginationDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = { status: 'PUBLISHED' as const };

    const [total, rawData] = await Promise.all([
      this.prisma.issue.count({ where }),
      this.prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          published_at: 'desc',
        },
        select: {
          id: true,
          title: true,
          issue_number: true,
          published_at: true,
          volume: {
            select: {
              volume_number: true,
              year: true,
            },
          },
          _count: {
            select: {
              articles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        },
      }),
    ]);

    const data = rawData.map(issue => ({
      ...issue,
      article_count: issue._count.articles,
      _count: undefined,
    }));

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

  async findLatest() {
    const issue = await this.prisma.issue.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: {
        published_at: 'desc', // Chronological ordering, not UUID
      },
      select: {
        id: true,
        title: true,
        issue_number: true,
        published_at: true,
        volume: {
          select: {
            volume_number: true,
            year: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      },
    });

    if (!issue) {
      throw new NotFoundException({
        success: false,
        error: { code: 'ISSUE_NOT_FOUND', message: 'No published issues found' }
      });
    }

    const data = {
      ...issue,
      article_count: issue._count.articles,
      _count: undefined,
    };

    return { success: true, data };
  }

  async findOne(id: string) {
    const issue = await this.prisma.issue.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        issue_number: true,
        published_at: true,
        description: true,
        volume: {
          select: {
            volume_number: true,
            year: true,
          },
        },
        articles: {
          where: { status: 'PUBLISHED' },
          orderBy: { published_at: 'asc' },
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
              select: {
                author: {
                  select: {
                    id: true,
                    full_name: true,
                    affiliation: true,
                    institution: true,
                    country: true,
                    orcid: true,
                  }
                },
                is_corresponding: true,
                author_order: true,
              },
              orderBy: { author_order: 'asc' },
            }
          }
        }
      }
    });

    if (!issue) {
      throw new NotFoundException({
        success: false,
        error: { code: 'ISSUE_NOT_FOUND', message: 'Issue not found' }
      });
    }

    return { success: true, data: issue };
  }
}
