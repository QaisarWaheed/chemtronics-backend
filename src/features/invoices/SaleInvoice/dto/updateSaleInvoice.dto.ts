import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSaleInvoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  computerNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  invoiceDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  deliveryNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  deliveryDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  poNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  poDate?: Date;

  @ApiProperty()
  @IsNotEmpty()
  account: string;

  @ApiProperty()
  @IsNotEmpty()
  accountTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  saleAccount: string;

  @ApiProperty()
  @IsNotEmpty()
  saleAccountTitle: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ntnNumber?: string;

  @ApiProperty({ type: [Object] })
  @IsNotEmpty()
  products: Array<{
    code: number;
    productName: string;
    hsCode: string;
    quantity: number;
    rate: number;
    netAmount: number;
    gstPercent: number;
    exGstRate: number;
    exGstAmount: number;
  }>;
  
  @ApiProperty()
  @IsNotEmpty()
  invoiceNumber: string;
}
