import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export type Category = 'Chemicals' | 'WaterPlants';

@Schema({ timestamps: true })
export class Products {
  declare _id: mongoose.Types.ObjectId;

  @ApiProperty()
  @Prop()
  productName: string;

  @ApiProperty()
  @Prop()
  sku: string;

  @ApiProperty()
  @Prop({ type: String, enum: ['Chemicals', 'WaterPlants'] })
  category: Category;

  @ApiProperty()
  @Prop()
  productDescription: string;

  @ApiProperty()
  @Prop()
  unitPrice: number;

  @ApiProperty()
  @Prop()
  costPrice: number;

  @ApiProperty()
  @Prop()
  stockQuantity: number;

  @ApiProperty()
  @Prop()
  minimumStockLevel: number;

  declare createAt: Date;

  declare updatedAt: Date;
}

const ProductsSchema = SchemaFactory.createForClass(Products);
export default ProductsSchema;
