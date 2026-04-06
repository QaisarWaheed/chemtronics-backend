/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Item name is required' })
  name!: string;

  @ApiProperty()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be 0 or greater' })
  price!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Unit quantity must be a number' })
  @Min(0.01, { message: 'Unit quantity must be greater than 0' })
  unit!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Product code must be a number' })
  code!: number;
}

export class SupplierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Supplier name is required' })
  name!: string;

  @ApiProperty()
  @IsNumber({}, { message: 'Supplier code must be a number' })
  code!: number;
}

//use reference of purchase invoice entity

export class CreatePurchaseInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Invoice number is required' })
  invoiceNumber!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'GST must be a number' })
  @Min(0, { message: 'GST must be 0 or greater' })
  gst?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ type: [PurchaseItemDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items!: PurchaseItemDto[];

  @ApiProperty({ type: SupplierDto })
  @ValidateNested()
  @Type(() => SupplierDto)
  supplier!: SupplierDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Purchase account is required' })
  purchaseAccount!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Purchase account title is required' })
  purchaseTitle!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  partyBillNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Party bill date must be a valid ISO 8601 date string' },
  )
  partyBillDate?: string;

  @ApiProperty()
  @IsNumber({}, { message: 'Total amount must be a number' })
  @Min(0, { message: 'Total amount must be 0 or greater' })
  totalAmount!: number;

  @ApiProperty()
  @IsDateString(
    {},
    { message: 'Invoice date must be a valid ISO 8601 date string' },
  )
  @IsNotEmpty({ message: 'Invoice date is required' })
  invoiceDate!: string;
}
