import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SubmitReviewDto } from './dto/submit-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const assignments = await this.prisma.reviewAssignment.findMany({
      where: { reviewer_id: userId },
      include: {
        round: {
          include: {
            submission: {
              select: {
                id: true,
                status: true,
                submitted_at: true,
                article: {
                  select: {
                    title: true,
                    abstract: true,
                    slug: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: assignments };
  }

  async findOne(userId: string, assignmentId: string) {
    const assignment = await this.prisma.reviewAssignment.findFirst({
      where: { id: assignmentId, reviewer_id: userId },
      include: {
        round: {
          include: {
            versions: {
              select: {
                id: true,
                version_number: true,
                notes: true,
                created_at: true,
                file: {
                  // ONLY SELECT non-identifying file metadata
                  select: {
                    id: true,
                    mime_type: true,
                    size: true,
                    created_at: true,
                    // original_name and uploaded_by are OMITTED to prevent identity leakage
                  }
                }
              }
            },
            submission: {
              select: {
                id: true,
                status: true,
                submitted_at: true,
                article: {
                  select: {
                    title: true,
                    abstract: true,
                    slug: true,
                    keywords: { include: { keyword: true } },
                    categories: { include: { category: true } },
                    // authors and submitted_by are STRICTLY OMITTED
                  }
                }
              }
            }
          }
        },
        review: true,
      }
    });

    if (!assignment) {
      throw new NotFoundException({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Review assignment not found' }
      });
    }

    return { success: true, data: assignment };
  }

  async accept(userId: string, assignmentId: string) {
    const assignment = await this.prisma.reviewAssignment.findFirst({
      where: { id: assignmentId, reviewer_id: userId },
    });

    if (!assignment) {
      throw new NotFoundException({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Review assignment not found' }
      });
    }

    if (assignment.status !== 'INVITED') {
      throw new BadRequestException({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only INVITED assignments can be accepted.' }
      });
    }

    await this.prisma.reviewAssignment.update({
      where: { id: assignmentId },
      data: { status: 'ACCEPTED' },
    });

    return { success: true, message: 'Review assignment accepted.' };
  }

  async decline(userId: string, assignmentId: string) {
    const assignment = await this.prisma.reviewAssignment.findFirst({
      where: { id: assignmentId, reviewer_id: userId },
    });

    if (!assignment) {
      throw new NotFoundException({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Review assignment not found' }
      });
    }

    if (assignment.status !== 'INVITED') {
      throw new BadRequestException({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only INVITED assignments can be declined.' }
      });
    }

    await this.prisma.reviewAssignment.update({
      where: { id: assignmentId },
      data: { status: 'DECLINED' },
    });

    return { success: true, message: 'Review assignment declined.' };
  }

  async submitReview(userId: string, assignmentId: string, dto: SubmitReviewDto) {
    const assignment = await this.prisma.reviewAssignment.findFirst({
      where: { id: assignmentId, reviewer_id: userId },
      include: { review: true }
    });

    if (!assignment) {
      throw new NotFoundException({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Review assignment not found' }
      });
    }

    if (assignment.status !== 'ACCEPTED') {
      throw new BadRequestException({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only ACCEPTED assignments can be submitted.' }
      });
    }

    if (assignment.review) {
      throw new BadRequestException({
        success: false,
        error: { code: 'REVIEW_EXISTS', message: 'This assignment already has a review.' }
      });
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Create the Review
      await tx.review.create({
        data: {
          assignment_id: assignmentId,
          recommendation: dto.recommendation,
          comments: dto.comments,
          confidential_comments: dto.confidential_comments,
        }
      });

      // 2. Change assignment status to COMPLETED
      await tx.reviewAssignment.update({
        where: { id: assignmentId },
        data: { status: 'COMPLETED' }
      });
    });

    return { success: true, message: 'Review submitted successfully.' };
  }
}
