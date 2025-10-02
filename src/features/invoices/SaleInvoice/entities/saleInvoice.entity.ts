import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export interface SaleInvoiceProduct {
  code: number;
  productName: string;
  hsCode: string;
  quantity: number;
  rate: number;
  netAmount: number;
  gstPercent: number;
  exGstRate: number;
  exGstAmount: number;
}

@Schema({ timestamps: true })
export class SaleInvoice {
  declare _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  invoiceDate: Date;

  @Prop()
  deliveryNumber?: string;

  @Prop()
  deliveryDate?: Date;

  @Prop()
  poNumber?: string;

  @Prop()
  poDate?: Date;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountTitle: string;

  @Prop({ required: true })
  saleAccount: string;

  @Prop({ required: true })
  saleAccountTitle: string;

  @Prop()
  province?: string;

  @Prop()
  ntnNumber?: string;

  @Prop({ required: true, type: [Object] })
  products: SaleInvoiceProduct[];

  @Prop()
  notes?: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const SaleInvoiceSchema = SchemaFactory.createForClass(SaleInvoice);
