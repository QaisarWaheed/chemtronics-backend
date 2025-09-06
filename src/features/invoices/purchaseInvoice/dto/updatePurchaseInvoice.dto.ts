import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import type { PurchaseTitle } from '../entities/purchaseInvoice.entity';

export class UpdatePurchaseInvoiceDto {
  @ApiProperty({ required: false })
  gst?: number;
  @ApiProperty()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty()
  @IsNotEmpty()
  referenceNumber: number;

  @ApiProperty()
  @IsNotEmpty()
  referenceDate: Date;

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
  status: string;

  @ApiProperty()
  @IsNotEmpty()
  invoiceDate: Date;
}
