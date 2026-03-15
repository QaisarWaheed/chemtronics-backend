import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DeliveryChalanItem {
  @Prop()
  sr: number;

  @Prop()
  itemCode: string;

  @Prop()
  particulars: string;

  @Prop()
  unit: string;

  @Prop()
  length: string;

  @Prop()
  width: string;

  @Prop()
  qty: string;

  @Prop()
  amount: number;
}

@Schema({ timestamps: true })
export class DeliveryChalan {
  declare _id: mongoose.Types.ObjectId;

  @Prop({ unique: true })
  id: string; // Challan ID (e.g., DC-1001)

  @Prop()
  chalanNo?: string; // Mirror of id — satisfies legacy MongoDB unique index

  @Prop()
  poNo: string;

  @Prop()
  poDate: string;

  @Prop()
  partyName: string;

  @Prop()
  partyAddress: string;

  @Prop()
  date: string;

  @Prop()
  deliveryDate: string;

  @Prop()
  status: string; // "Delivered" | "In Transit" | "Pending"

  @Prop({ type: [Object] })
  items: DeliveryChalanItem[];

  @Prop()
  invoiceReference?: string; // Original Sale Invoice number this challan was created from

  declare createdAt: Date;
  declare updatedAt: Date;
}

const DeliveryChalanSchema = SchemaFactory.createForClass(DeliveryChalan);
export default DeliveryChalanSchema;
