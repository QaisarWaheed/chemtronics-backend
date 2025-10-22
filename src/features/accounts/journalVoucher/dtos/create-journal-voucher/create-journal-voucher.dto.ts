/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CreateJournalVoucherDto {
  @ApiProperty({ required: true, type: Date })
  date: Date;

  @ApiProperty({ required: true })
  voucherNumber: string;

  @ApiProperty({ required: true })
  accountNumber: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false, type: Number })
  credit?: number;

  @ApiProperty({ required: false, type: Number })
  debit?: number;
}
