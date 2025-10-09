import { ApiProperty } from '@nestjs/swagger';
import type { Role } from '../entities/User.entity';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
    enum: ['Super Admin', 'Company Admin', 'Accounts User', 'Staff'],
    default: 'Staff',
  })
  role: Role;
}
