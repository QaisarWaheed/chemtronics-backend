
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class DeliveryChalanItemDto {
  @IsOptional()
  srNo?: number;

  @IsOptional()
  itemName?: string;

  @IsOptional()
  unit?: string;

  @IsOptional()
  quantity?: number;
}

export class CreateDeliveryChalanDto {
  @IsString()
  chalanNo: string;

  @IsDateString()
  deliveryDate: string;

  @IsOptional()
  @IsString()
  poNo?: string;

  @IsOptional()
  @IsDateString()
  poDate?: string;

  @IsString()
  partyName: string;

  @IsString()
  partyAddress: string;

  items: DeliveryChalanItemDto[];
}

export class UpdateDeliveryChalanDto {
  @IsOptional()
  @IsString()
  chalanNo?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

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
  items?: DeliveryChalanItemDto[];
}
