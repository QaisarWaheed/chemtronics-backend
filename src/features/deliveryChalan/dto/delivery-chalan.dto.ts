import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class DeliveryChalanItemDto {
  @IsNumber()
  sr!: number;

  @IsString()
  itemCode!: string;

  @IsString()
  particulars!: string;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsString()
  length?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsString()
  qty!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;
}

export class CreateDeliveryChalanDto {
  @IsString()
  id!: string; // Changed from chalanNo to id to match frontend

  @IsString()
  poNo!: string;

  @IsDateString()
  poDate!: string;

  @IsString()
  partyName!: string;

  @IsString()
  partyAddress!: string;

  @IsDateString()
  date!: string;

  @IsDateString()
  deliveryDate!: string;

  @IsString()
  status!: string; // "Delivered" | "In Transit" | "Pending"

  @IsArray()
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
}
