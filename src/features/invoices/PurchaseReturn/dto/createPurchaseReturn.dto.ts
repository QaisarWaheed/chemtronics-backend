import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePurchaseReturnDto {
  @ApiProperty()
  @IsNotEmpty()
  invoiceNumber: number;

  @ApiProperty()
  @IsNotEmpty()
  invoiceDate: Date;

  @ApiProperty({ type: Object })
  @IsNotEmpty()
  supplier: { name: string };

  @ApiProperty()
  @IsNotEmpty()
  supplierTitle: string;

  @ApiProperty({ required: false })
  @IsOptional()
  purchaseAccount?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  purchaseTitle?: string;

  @ApiProperty({ type: [Object] })
  @IsNotEmpty()
  products: Array<{
    code: number;
    productName: string;
    unit: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;

  @ApiProperty({ required: false })
  @IsOptional()
  gst?: number;
}
