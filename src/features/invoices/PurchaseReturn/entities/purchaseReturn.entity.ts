import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export interface PurchaseReturnProduct {
  code: number;
  productName: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

@Schema({ timestamps: true })
export class PurchaseReturn {
  declare _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  invoiceNumber: number;

  @Prop({ required: true })
  invoiceDate: Date;

  @Prop({ required: true, type: Object })
  supplier: { name: string };

  @Prop({ required: true })
  supplierTitle: string;

  @Prop({ required: true })
  purchaseAccount: string;

  @Prop({ required: true })
  purchaseTitle: string;

  @Prop({ required: true, type: [Object] })
  products: PurchaseReturnProduct[];

  @Prop()
  gst?: number;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const PurchaseReturnSchema =
  SchemaFactory.createForClass(PurchaseReturn);
