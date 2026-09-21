import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum ReviewRecommendation {
  ACCEPT = 'ACCEPT',
  MINOR_REVISION = 'MINOR_REVISION',
  MAJOR_REVISION = 'MAJOR_REVISION',
  REJECT = 'REJECT',
}

export class SubmitReviewDto {
  @IsEnum(ReviewRecommendation)
  recommendation: ReviewRecommendation;

  @IsString()
  comments: string;

  @IsOptional()
  @IsString()
  confidential_comments?: string;
}
