import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export interface SaleReturnProduct {
  code: number;
  productName: string;
  unit: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  discountPercent: number;
  discount: number;
  netAmount: number;
}

@Schema({ timestamps: true })
export class SaleReturn {
  declare _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ required: true })
  invoiceDate: Date;

  @Prop({ required: true })
  customer: string;

  @Prop({ required: true })
  customerTitle: string;

  @Prop({ required: true })
  saleAccount: string;

  @Prop({ required: true })
  saleTitle: string;

  @Prop({ required: true })
  salesman: string;

  @Prop({ required: true, type: [Object] })
  products: SaleReturnProduct[];

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const SaleReturnSchema = SchemaFactory.createForClass(SaleReturn);
