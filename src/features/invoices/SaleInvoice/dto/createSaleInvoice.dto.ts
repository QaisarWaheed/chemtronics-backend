import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaleInvoiceProductDto {
  @ApiProperty()
  @IsNumber({}, { message: 'Product code must be a number' })
  code!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  productName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'HS code is required' })
  hsCode!: string;

  @ApiProperty()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Rate must be a number' })
  @Min(0, { message: 'Rate must be 0 or greater' })
  rate!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Net amount must be a number' })
  @Min(0, { message: 'Net amount must be 0 or greater' })
  netAmount!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'GST percent must be a number' })
  @Min(0, { message: 'GST percent must be 0 or greater' })
  gstPercent!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'ExGST rate must be a number' })
  @Min(0, { message: 'ExGST rate must be 0 or greater' })
  exGstRate!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'ExGST amount must be a number' })
  @Min(0, { message: 'ExGST amount must be 0 or greater' })
  exGstAmount!: number;
}

export class CreateSaleInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Computer number/invoice number is required' })
  computerNumber!: string;

  @ApiProperty()
  @IsDateString(
    {},
    { message: 'Invoice date must be a valid ISO 8601 date string' },
  )
  @IsNotEmpty({ message: 'Invoice date is required' })
  invoiceDate!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deliveryNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Delivery date must be a valid ISO 8601 date string' },
  )
  deliveryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'PO date must be a valid ISO 8601 date string' })
  poDate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Account code is required' })
  account!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Account title is required' })
  accountTitle!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Sale account is required' })
  saleAccount!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Sale account title is required' })
  saleAccountTitle!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ntnNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  strnNumber?: string;

  @ApiProperty({ type: [SaleInvoiceProductDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one product is required' })
  @ValidateNested({ each: true })
  @Type(() => SaleInvoiceProductDto)
  products!: SaleInvoiceProductDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Invoice number is required' })
  invoiceNumber!: string;
}
