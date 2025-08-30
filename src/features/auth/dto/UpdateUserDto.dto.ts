import { ApiProperty } from '@nestjs/swagger';
import type { Role } from '../entities/User.entity';

export class UpdateUserDto {
  @ApiProperty()
  userName: string;

  @ApiProperty({
    type: String,
    enum: ['SuperAdmin', 'CompanyAdmin', 'Accountant', 'Staff'],
    default: 'Staff',
  })
  role: Role;
}
