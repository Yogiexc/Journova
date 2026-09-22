import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { UploadVersionDto } from './dto/upload-version.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to fetch or create Author profile from User
   */
  private async getOrCreateAuthorProfile(userId: string) {
    let author = await this.prisma.author.findFirst({
      where: { user_id: userId },
    });

    if (!author) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      author = await this.prisma.author.create({
        data: {
          user_id: user.id,
          full_name: user.name,
          email: user.email,
        },
      });
    }

    return author;
  }

  async create(userId: string, createSubmissionDto: CreateSubmissionDto) {
    const author = await this.getOrCreateAuthorProfile(userId);

    // Create the full submission structure using Prisma transaction to ensure atomicity
    const submission = await this.prisma.$transaction(async (tx) => {
      // 1. Create Article (DRAFT)
      const articleSlug = createSubmissionDto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + randomUUID().split('-')[0];
      const article = await tx.article.create({
        data: {
          journal_id: createSubmissionDto.journal_id,
          title: createSubmissionDto.title,
          slug: articleSlug,
          abstract: createSubmissionDto.abstract,
          status: 'DRAFT',
          authors: {
            create: [
              {
                author_id: author.id,
                author_order: 1,
                is_corresponding: true,
              }
            ]
          },
          ...(createSubmissionDto.category_id && {
            categories: {
              create: [{ category_id: createSubmissionDto.category_id }]
            }
          }),
          ...(createSubmissionDto.keywords && createSubmissionDto.keywords.length > 0 && {
            keywords: {
              create: createSubmissionDto.keywords.map(kwName => ({
                keyword: {
                  connectOrCreate: {
                    where: { name: kwName },
                    create: { name: kwName, slug: kwName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
                  }
                }
              }))
            }
          })
        },
        select: { id: true, slug: true }
      });

      // 2. Create Submission (DRAFT)
      const newSubmission = await tx.submission.create({
        data: {
          article_id: article.id,
          submitted_by: userId,
          status: 'DRAFT',
          rounds: {
            create: [
              { round_number: 1, status: 'IN_PROGRESS' }
            ]
          }
        },
        include: {
          article: true,
          rounds: true,
        }
      });

      return newSubmission;
    });

    return { success: true, data: submission };
  }

  async findAll(userId: string) {
    const submissions = await this.prisma.submission.findMany({
      where: { submitted_by: userId },
      include: {
        article: {
          select: { title: true, status: true, slug: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    return { success: true, data: submissions };
  }

  async findOne(userId: string, id: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { 
        id,
        submitted_by: userId // OWNERSHIP CHECK
      },
      include: {
        article: {
          include: {
            authors: {
              include: { author: true }
            }
          }
        },
        rounds: {
          include: {
            versions: {
              include: { file: true }
            }
          },
          orderBy: { round_number: 'desc' }
        }
      }
    });

    if (!submission) {
      throw new NotFoundException({
        success: false,
        error: { code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found' }
      });
    }

    return { success: true, data: submission };
  }

  async uploadVersion(userId: string, submissionId: string, uploadDto: UploadVersionDto) {
    // Check ownership and existence
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, submitted_by: userId },
      include: {
        rounds: {
          orderBy: { round_number: 'desc' },
          take: 1
        }
      }
    });

    if (!submission) {
      throw new NotFoundException({
        success: false,
        error: { code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found' }
      });
    }

    let roundId = submission.rounds[0]?.id;
    let roundNumber = submission.rounds[0]?.round_number || 1;
    
    // If the latest round is COMPLETED (e.g. from a revision decision), create a new round for the resubmission
    if (submission.rounds[0]?.status === 'COMPLETED') {
      const newRound = await this.prisma.submissionRound.create({
        data: {
          submission_id: submission.id,
          round_number: roundNumber + 1,
          status: 'IN_PROGRESS',
        }
      });
      roundId = newRound.id;
    }

    if (!roundId) {
      throw new BadRequestException('No active round found for this submission.');
    }

    // Since we don't take file_id from DTO to prevent injection, we mock the file creation here.
    const file = await this.prisma.$transaction(async (tx) => {
      const newFile = await tx.file.create({
        data: {
          storage_provider: 'mock',
          storage_key: `mock/submissions/${submissionId}/manuscript-${randomUUID()}.pdf`,
          original_name: 'manuscript.pdf',
          mime_type: 'application/pdf',
          size: 1024 * 1024, // 1MB mock size
          uploaded_by: userId,
        }
      });

      // Find highest version number in this round
      const existingVersions = await tx.submissionVersion.findMany({
        where: { round_id: roundId },
        orderBy: { version_number: 'desc' },
        take: 1
      });
      const nextVersion = existingVersions.length > 0 ? existingVersions[0].version_number + 1 : 1;

      await tx.submissionVersion.create({
        data: {
          round_id: roundId,
          version_number: nextVersion,
          file_id: newFile.id,
          uploaded_by: userId,
          notes: uploadDto.notes,
        }
      });

      return newFile;
    });

    return { success: true, data: { file_id: file.id, message: 'Version uploaded successfully.' } };
  }

  async submit(userId: string, submissionId: string) {
    // 1. Verify ownership and current status
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, submitted_by: userId },
      include: {
        rounds: {
          include: {
            versions: true
          }
        }
      }
    });

    if (!submission) {
      throw new NotFoundException({
        success: false,
        error: { code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found' }
      });
    }

    if (submission.status !== 'DRAFT' && submission.status !== 'REVISION_REQUIRED') {
      throw new BadRequestException({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Only DRAFT or REVISION_REQUIRED submissions can be submitted.' }
      });
    }

    // 2. Check if a manuscript file was uploaded
    const hasVersions = submission.rounds.some(r => r.versions.length > 0);
    if (!hasVersions) {
      throw new BadRequestException({
        success: false,
        error: { code: 'MISSING_FILE', message: 'You must upload a manuscript file before submitting.' }
      });
    }

    const newStatus = submission.status === 'REVISION_REQUIRED' ? 'UNDER_REVIEW' : 'SUBMITTED';

    // 3. Atomically update both Submission and Article statuses using a transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submissionId },
        data: { 
          status: newStatus,
          submitted_at: new Date() // Will update every time they submit, maybe we only want to set it once, but it's fine for now
        }
      });

      await tx.article.update({
        where: { id: submission.article_id },
        data: { status: newStatus }
      });
    });

    return { success: true, message: `Submission successfully updated to ${newStatus}.` };
  }
}
