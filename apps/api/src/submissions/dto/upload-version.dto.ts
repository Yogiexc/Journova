import { IsString, IsOptional } from 'class-validator';

export class UploadVersionDto {
  @IsOptional()
  @IsString()
  notes?: string;
  
  // Note: We do not accept file_id here to prevent IDOR attacks.
  // The server will mock the file creation.
}
