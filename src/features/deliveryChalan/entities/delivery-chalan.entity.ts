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
  id: string; // Challan ID (e.g., DC-0001)

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

  declare createdAt: Date;
  declare updatedAt: Date;
}

const DeliveryChalanSchema = SchemaFactory.createForClass(DeliveryChalan);
export default DeliveryChalanSchema;
