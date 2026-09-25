import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'author@university.edu', description: 'The email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'strongpassword123', description: 'The password of the user (min 8 characters)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
