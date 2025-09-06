import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type AccountType =
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Revenue'
  | 'Expense';
export type ParentAccount =
  | '1000-Assets'
  | '1100-Current-Assets'
  | '1110-CashInHands'
  | '1120-CashAtBank'
  | '1130-AccountsReceiveable'
  | '1200-fixedAssets'
  | '1220-Furniture & fixtures'
  | '2000-Liabilities'
  | '2100-current Liabilities'
  | '2110-AccountsPayable'
  | '2120-AccuredExpenses'
  | '2200-Long-Term Liabilites'
  | '2210-Bank Loan'
  | '300-Equity'
  | "3100-Owner's Equity"
  | '3200-Retained Earnings'
  | '4000-Revenue'
  | '4100-sales revenue'
  | '4200-serviceRevenue'
  | '5000-Expenses'
  | '5100-operating Expenses'
  | '5110-salaries & wages'
  | '5120-Rent Expense'
  | '5130-Utilities'
  | '5200- administrative expenses'
  | '5210-office supplies'
  | '5220-professional fees';
export type AccountGroupType = 'Group' | 'Detail';

@Schema({ timestamps: true })
export class ChartOfAccount {
  declare _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  selectedCode: string;

  @Prop({ required: true })
  accountCode: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ required: true })
  accountType: AccountType;

  @Prop({ required: true })
  parentAccount: ParentAccount;

  @Prop({ required: true })
  type: AccountGroupType;

  @Prop({ default: false })
  isParty: boolean;

  @Prop()
  address?: string;

  @Prop()
  phoneNo?: string;

  @Prop()
  salesTaxNo?: string;

  @Prop()
  ntn?: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const ChartOfAccountSchema =
  SchemaFactory.createForClass(ChartOfAccount);
