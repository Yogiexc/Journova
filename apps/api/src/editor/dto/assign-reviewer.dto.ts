import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignReviewerDto {
  @IsUUID()
  @IsNotEmpty()
  reviewer_id: string;
}
