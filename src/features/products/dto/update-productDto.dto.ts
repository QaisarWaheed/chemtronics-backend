import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import type { Category } from '../entities/product.entity';

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  code?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: Category;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  /** Cost price of the product */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  /** Alias kept for backward compat (maps to costPrice) */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rate?: number;

  /** Current stock quantity */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  /** Opening stock — fixed baseline set at creation */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  openingQuantity?: number;

  /** Alias for quantity used by some callers */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minimumStockLevel?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
