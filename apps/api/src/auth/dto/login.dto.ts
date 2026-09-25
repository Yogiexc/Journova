import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'author@university.edu', description: 'The email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'strongpassword123', description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
