import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type Role = 'SuperAdmin' | 'CompanyAdmin' | 'Accountant' | 'Staff';

@Schema({
  timestamps: true,
})
export class UserEntity {
  declare _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop()
  userName: string;

  @ApiProperty()
  @Prop()
  password: string;

  @ApiProperty({
    type: String,
    enum: ['SuperAdmin', 'CompanyAdmin', 'Accountant', 'Staff'],
    default: 'Staff',
  })
  @Prop({
    type: String,
    enum: ['SuperAdmin', 'CompanyAdmin', 'Accountant', 'Staff'],
    default: 'Staff',
  })
  role: Role;

  declare createAt: Date;
  declare updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(UserEntity);
export default UserSchema;
