import { IsNotEmpty, IsEnum } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(SubmissionStatus)
  @IsNotEmpty()
  status: SubmissionStatus;
}
