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

  @ApiProperty({ type: String, enum: ['Chemicals', 'Equipments', 'Services'] })
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
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  minimumStockLevel: number;
}
