import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryChalanItemDto {
  @IsNumber()
  @Min(1, { message: 'Serial number must be at least 1' })
  sr!: number;

  @IsString()
  @IsNotEmpty({ message: 'Item code is required' })
  itemCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'Particulars/description is required' })
  particulars!: string;

  @IsString()
  @IsNotEmpty({ message: 'Unit is required' })
  unit!: string;

  @IsOptional()
  @IsString()
  length?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  qty!: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Amount must be 0 or greater' })
  amount?: number;
}

export class CreateDeliveryChalanDto {
  @IsString()
  @IsNotEmpty({ message: 'Challan ID is required' })
  id!: string; // Changed from chalanNo to id to match frontend

  @IsString()
  @IsNotEmpty({ message: 'PO number is required' })
  poNo!: string;

  @IsDateString({}, { message: 'PO date must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'PO date is required' })
  poDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'Party name is required' })
  partyName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Party address is required' })
  partyAddress!: string;

  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'Date is required' })
  date!: string;

  @IsDateString(
    {},
    { message: 'Delivery date must be a valid ISO 8601 date string' },
  )
  @IsNotEmpty({ message: 'Delivery date is required' })
  deliveryDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  status!: string; // "Delivered" | "In Transit" | "Pending"

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => DeliveryChalanItemDto)
  items!: DeliveryChalanItemDto[];
}

export class UpdateDeliveryChalanDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  poNo?: string;

  @IsOptional()
  @IsDateString()
  poDate?: string;

  @IsOptional()
  @IsString()
  partyName?: string;

  @IsOptional()
  @IsString()
  partyAddress?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  items?: DeliveryChalanItemDto[];

  @IsOptional()
  @IsString()
  invoiceReference?: string;
}
