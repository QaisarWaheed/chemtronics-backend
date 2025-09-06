import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import type { Category } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  code: number;

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
  unit: string;

  @ApiProperty()
  @IsNotEmpty()
  rate: number;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  minimumStockLevel: number;
}
