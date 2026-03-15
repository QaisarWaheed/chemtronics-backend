import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

@Schema({ timestamps: false })
export class AuditLog {
  @ApiProperty()
  @Prop({ required: true })
  declare userId: string;

  @ApiProperty()
  @Prop({ required: true })
  declare userName: string;

  @ApiProperty()
  @Prop({ required: true })
  declare brand: string;

  @ApiProperty({ enum: ['CREATE', 'UPDATE', 'DELETE'] })
  @Prop({ required: true, enum: ['CREATE', 'UPDATE', 'DELETE'] })
  declare action: AuditAction;

  @ApiProperty()
  @Prop({ required: true })
  declare module: string;

  @ApiProperty()
  @Prop({ required: true })
  declare description: string;

  @ApiProperty()
  @Prop({ required: true, default: () => new Date() })
  declare timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
// Fast lookups by time, brand, and module for the admin query
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ brand: 1, module: 1 });
