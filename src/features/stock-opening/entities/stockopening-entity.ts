import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
//id, product, opening date, cost per unit, total value
export class StockOpening {
  declare id: mongoose.Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  product: string;

  @ApiProperty()
  @Prop({ required: true })
  openingDate: Date;

  @ApiProperty()
  @Prop({ required: true })
  costPerUnit: number;

  @ApiProperty()
  @Prop({ required: true })
  totalValue: number;

  @ApiProperty()
  @Prop({ required: true })
  openingQuantity: number;

  declare createdAt: Date;

  declare updatedAt: Date;
}

const StockopeningSchema = SchemaFactory.createForClass(StockOpening);
export default StockopeningSchema;
