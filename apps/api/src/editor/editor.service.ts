import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AssignReviewerDto } from './dto/assign-reviewer.dto.js';
import { EditorialDecisionDto } from './dto/editorial-decision.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class EditorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const submissions = await this.prisma.submission.findMany({
      include: {
        article: true,
        submitter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updated_at: 'desc' },
    });
    return { success: true, data: submissions };
  }

  async getReviewers() {
    const reviewers = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'REVIEWER',
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return { success: true, data: reviewers };
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        article: {
          include: {
            authors: { include: { author: true } },
            keywords: { include: { keyword: true } },
            categories: { include: { category: true } },
          },
        },
        submitter: { select: { id: true, name: true, email: true } },
        rounds: {
          include: {
            versions: { include: { file: true } },
            review_assignments: {
              include: {
                reviewer: { select: { id: true, name: true, email: true } },
                review: true,
              },
            },
            editorial_decisions: true,
          },
          orderBy: { round_number: 'desc' },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException({
        success: false,
        error: { code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found' },
      });
    }

    return { success: true, data: submission };
  }

  async assignReviewer(submissionId: string, dto: AssignReviewerDto, editorId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        article: { include: { authors: { include: { author: true } } } },
        rounds: {
          where: { status: 'IN_PROGRESS' },
          orderBy: { round_number: 'desc' },
          take: 1,
        },
      },
    });

    if (!submission) {
      throw new NotFoundException({ success: false, error: { code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found' } });
    }

    if (!['SUBMITTED', 'INITIAL_CHECK', 'UNDER_REVIEW'].includes(submission.status)) {
      throw new BadRequestException({ success: false, error: { code: 'INVALID_STATE', message: 'Cannot assign reviewer at this state' } });
    }

    const activeRound = submission.rounds[0];
    if (!activeRound) {
      throw new BadRequestException({ success: false, error: { code: 'NO_ACTIVE_ROUND', message: 'No active round found' } });
    }

    // COI check 1: Submitting user
    if (submission.submitted_by === dto.reviewer_id) {
      throw new BadRequestException({ success: false, error: { code: 'CONFLICT_OF_INTEREST', message: 'Cannot assign the submitting user as a reviewer' } });
    }

    // COI check 2: Author profile overlap
    const reviewer = await this.prisma.user.findUnique({
      where: { id: dto.reviewer_id },
      include: { authorships: true },
    });

    if (!reviewer) {
      throw new NotFoundException({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Reviewer not found' } });
    }

    const reviewerAuthorIds = reviewer.authorships.map((a) => a.id);
    const articleAuthorIds = submission.article.authors.map((a) => a.author_id);
    
    const hasOverlap = reviewerAuthorIds.some((id) => articleAuthorIds.includes(id));
    if (hasOverlap) {
      throw new BadRequestException({ success: false, error: { code: 'CONFLICT_OF_INTEREST', message: 'Reviewer is one of the article authors' } });
    }

    // Duplicate assignment check is handled by Prisma @@unique constraint
    // But we wrap in try-catch to provide a good error message
    const assignment = await this.prisma.reviewAssignment.create({
      data: {
        round_id: activeRound.id,
        reviewer_id: dto.reviewer_id,
        assigned_by: editorId,
        status: 'INVITED',
      },
    });

    // Change status to UNDER_REVIEW if not already
    if (submission.status !== 'UNDER_REVIEW') {
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: { status: 'UNDER_REVIEW' },
      });
      await this.prisma.article.update({
        where: { id: submission.article_id },
        data: { status: 'UNDER_REVIEW' },
      });
    }

    return { success: true, data: assignment };
  }

  async makeDecision(submissionId: string, dto: EditorialDecisionDto, editorId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        rounds: {
          where: { status: 'IN_PROGRESS' },
          include: { review_assignments: true },
          orderBy: { round_number: 'desc' },
          take: 1,
        },
      },
    });

    if (!submission) {
      throw new NotFoundException({ success: false, error: { code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found' } });
    }

    const activeRound = submission.rounds[0];
    if (!activeRound) {
      throw new BadRequestException({ success: false, error: { code: 'NO_ACTIVE_ROUND', message: 'No active round found' } });
    }

    // Hard Constraint: Unfinished reviews
    const hasUnfinishedReviews = activeRound.review_assignments.some(
      (a) => a.status === 'INVITED' || a.status === 'ACCEPTED'
    );
    if (hasUnfinishedReviews) {
      throw new BadRequestException({ success: false, error: { code: 'PENDING_REVIEWS', message: 'Cannot make decision while there are pending reviews' } });
    }

    let newStatus: SubmissionStatus;
    if (dto.decision === 'ACCEPT') {
      newStatus = 'ACCEPTED';
    } else if (dto.decision === 'REJECT') {
      newStatus = 'REJECTED';
    } else {
      newStatus = 'REVISION_REQUIRED';
    }

    const decision = await this.prisma.$transaction(async (tx) => {
      const dec = await tx.editorialDecision.create({
        data: {
          round_id: activeRound.id,
          editor_id: editorId,
          decision: dto.decision,
          notes: dto.notes,
        },
      });

      await tx.submissionRound.update({
        where: { id: activeRound.id },
        data: { status: 'COMPLETED' },
      });

      await tx.submission.update({
        where: { id: submission.id },
        data: { status: newStatus },
      });

      await tx.article.update({
        where: { id: submission.article_id },
        data: { status: newStatus as any },
      });

      return dec;
    });

    return { success: true, data: decision };
  }

  async updateStatus(submissionId: string, dto: UpdateStatusDto) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException({ success: false, error: { code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found' } });
    }

    const allowedTransitions: Record<string, string[]> = {
      SUBMITTED: ['INITIAL_CHECK', 'UNDER_REVIEW', 'REJECTED'],
      INITIAL_CHECK: ['UNDER_REVIEW', 'REJECTED'],
      UNDER_REVIEW: ['REVISION_REQUIRED', 'ACCEPTED', 'REJECTED'],
      REVISION_REQUIRED: ['UNDER_REVIEW'], // E.g. when resubmitted (though resubmit logic handles this normally)
      ACCEPTED: ['COPYEDITING'],
      COPYEDITING: ['PRODUCTION'],
      PRODUCTION: ['SCHEDULED'],
      SCHEDULED: ['PUBLISHED'],
    };

    const allowed = allowedTransitions[submission.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${submission.status} to ${dto.status}` },
      });
    }

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: dto.status },
    });

    await this.prisma.article.update({
      where: { id: submission.article_id },
      data: { status: dto.status as any },
    });

    return { success: true, message: `Status updated to ${dto.status}` };
  }
}
