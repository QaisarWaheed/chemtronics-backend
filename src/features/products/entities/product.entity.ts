import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export type Category = 'Chemicals' | 'Equipments' | 'Services';

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
  @Prop({ type: String, enum: ['Chemicals', 'WaterPlants'] })
  category: Category;

  @ApiProperty()
  @Prop()
  productDescription: string;

  @ApiProperty()
  @Prop()
  unitPrice: string;

  @ApiProperty()
  @Prop()
  costPrice: number;

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
