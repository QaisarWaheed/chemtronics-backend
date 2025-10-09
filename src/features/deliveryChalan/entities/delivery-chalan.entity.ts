import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { mongo } from 'mongoose';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

 @Schema({ timestamps: true })
export class DeliveryChalan {
 
 declare id: mongoose.Types.ObjectId;

  @Prop({ unique: true })
  chalanNo: string;

  @Prop({ type: Date })
  deliveryDate: string;

  @Prop({ nullable: true })
  poNo: string;

  @Prop({ type: Date, nullable: true })
  poDate: string;

  @Prop()
  partyName: string;

  @Prop()
  partyAddress: string;

declare createAt: Date;
declare updatedAt: Date;

}

const DeliveryChalanSchema = SchemaFactory.createForClass(DeliveryChalan);
export default DeliveryChalanSchema;