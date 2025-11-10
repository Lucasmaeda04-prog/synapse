import { IsString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Firebase UID do usuário' })
  @IsString()
  @IsNotEmpty()
  uid!: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Role do usuário', enum: ['ADMIN', 'TEACHER', 'STUDENT'] })
  @IsEnum(['ADMIN', 'TEACHER', 'STUDENT'])
  @IsNotEmpty()
  role!: 'ADMIN' | 'TEACHER' | 'STUDENT';
}
