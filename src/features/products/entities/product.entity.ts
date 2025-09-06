import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export type Category = 'Chemicals' | 'WaterPlants';

@Schema({ timestamps: true })
export class Products {
  declare _id: mongoose.Types.ObjectId;

  @ApiProperty()
  @Prop()
  code: number;

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
  unit: string;

  @ApiProperty()
  @Prop()
  rate: number;

  @ApiProperty()
  @Prop()
  quantity: number;

  @ApiProperty()
  @Prop()
  minimumStockLevel: number;

  declare createAt: Date;

  declare updatedAt: Date;
}

const ProductsSchema = SchemaFactory.createForClass(Products);
export default ProductsSchema;
