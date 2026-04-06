import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
  IsEnum,
  Max,
} from 'class-validator';
import type { Category } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty()
  @IsNumber({}, { message: 'Product code must be a number' })
  @Min(1, { message: 'Product code must be at least 1' })
  code!: number;

  @ApiProperty()
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  productName!: string;

  @ApiProperty({ type: String, enum: ['Chemicals', 'Equipments', 'Services'] })
  @IsEnum(['Chemicals', 'Equipments', 'Services'], {
    message: 'Category must be one of: Chemicals, Equipments, Services',
  })
  @IsNotEmpty({ message: 'Category is required' })
  category!: Category;

  @ApiProperty()
  @IsString({ message: 'Product description must be a string' })
  @IsNotEmpty({ message: 'Product description is required' })
  productDescription!: string;

  @ApiProperty()
  @IsNumber({}, { message: 'Unit price must be a number' })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Cost price must be a number' })
  @Min(0, { message: 'Cost price cannot be negative' })
  costPrice!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity!: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Minimum stock level must be a number' })
  @Min(0, { message: 'Minimum stock level cannot be negative' })
  minimumStockLevel!: number;
}
