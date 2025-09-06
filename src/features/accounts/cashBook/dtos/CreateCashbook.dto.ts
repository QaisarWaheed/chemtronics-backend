import { ApiProperty } from '@nestjs/swagger';

export class CreateCashbookDto {
  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: ['cashRecipt', 'cashPayment'] })
  entryType: 'cashRecipt' | 'cashPayment';

  @ApiProperty()
  particulars: string;

  @ApiProperty()
  amount: number;
}
