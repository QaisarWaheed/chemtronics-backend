import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import type { Category } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ type: String, enum: ['Chemicals', 'WaterPlants'] })
  @IsNotEmpty()
  category: Category;

  @ApiProperty()
  @IsNotEmpty()
  productDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  unitPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  costPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  stockQuantity: number;

  @ApiProperty()
  @IsNotEmpty()
  minimumStockLevel: number;
}
