/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateOpeningBalanceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  credit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  debit: number;
}
