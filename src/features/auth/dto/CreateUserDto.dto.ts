import { ApiProperty } from '@nestjs/swagger';
import type { Role } from '../entities/User.entity';
import { IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  userName: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
    enum: ['SuperAdmin', 'CompanyAdmin', 'Accountant', 'Staff'],
    default: 'Staff',
  })
  role: Role;
}
