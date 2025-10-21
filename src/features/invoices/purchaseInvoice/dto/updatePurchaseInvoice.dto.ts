/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePurchaseInvoiceDto {
  @ApiProperty({ required: false })
  gst?: number;

  @ApiProperty({ required: false })
  customerName?: string;

  @ApiProperty({ type: [Object] })
  @IsNotEmpty()
  items: Array<{ name: string; price: number; unit: number; code: number }>;

  @ApiProperty({ type: Object })
  @IsNotEmpty()
  supplier: { name: string; code: number };

  @ApiProperty()
  @IsNotEmpty()
  purchaseAccount: string;

  @ApiProperty()
  @IsNotEmpty()
  purchaseTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty()
  partyBillNumber: string;

  @ApiProperty()
  partyBillDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  invoiceDate: Date;
}
