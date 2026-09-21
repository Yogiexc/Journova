import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Recommendation } from '@prisma/client';

export class EditorialDecisionDto {
  @IsEnum(Recommendation)
  @IsNotEmpty()
  decision: Recommendation;

  @IsString()
  @IsOptional()
  notes?: string;
}
