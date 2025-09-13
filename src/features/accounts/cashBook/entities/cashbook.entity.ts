import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type EntryType = 'cashReciept' | 'cashPayment';

@Schema({ timestamps: true })
export class Cashbook {
  @ApiProperty()
  @Prop({ type: Date })
  date: Date;

  @ApiProperty({ enum: ['cashReciept', 'cashPayment'] })
  @Prop({ type: String, enum: ['cashReciept', 'cashPayment'] })
  entryType: EntryType;

  @ApiProperty()
  @Prop()
  particulars: string;

  @ApiProperty()
  @Prop()
  amount: number;

  declare createdAt: Date;
}

export const CashbookSchema = SchemaFactory.createForClass(Cashbook);
