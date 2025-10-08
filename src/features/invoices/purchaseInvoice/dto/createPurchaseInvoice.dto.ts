import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import type { PurchaseTitle } from '../entities/purchaseInvoice.entity';

//use reference of purchase invoice entity

export class CreatePurchaseInvoiceDto {
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
  purchaseTitle: PurchaseTitle;

  @ApiProperty()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  invoiceDate: Date;
}
