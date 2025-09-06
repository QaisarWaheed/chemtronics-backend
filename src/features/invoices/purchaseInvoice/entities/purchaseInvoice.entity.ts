import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export interface Product {
  name: string;
  price: number;
  unit: number;
  code: number;
}

export interface Supplier {
  name: string;
  code: number;
}

export type PurchaseTitle = 'Stock';

@Schema({ timestamps: true })
export class PurchaseInvoice {
  @Prop()
  gst?: number;
  declare invoiceNumber: mongoose.Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  referenceNumber: number;

  @Prop({ required: true })
  referenceDate: Date;

  @Prop({ required: true })
  items: Product[];

  @Prop({ required: true, type: Object })
  supplier: Supplier;

  @Prop()
  purchaseAccount: string;

  @Prop()
  purchaseTitle: PurchaseTitle;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  status: string;

  @Prop({ default: Date.now })
  InvoiceDate: Date;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const PurchaseInvoiceSchema =
  SchemaFactory.createForClass(PurchaseInvoice);
