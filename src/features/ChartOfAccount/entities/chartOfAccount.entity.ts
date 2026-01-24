/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type ParentAccount =
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Revenue'
  | 'Expense';
export type AccountType =
  | '1000-Assets'
  | '1100-Current-Assets'
  | '1110-Cash'
  | '1120-Bank Accounts'
  | '1130-Other Current Assets'
  | '1200-Fixed Assets'
  | '1300-Inventories'
  | '1400-Receivables'
  | '1410-Receivables Accounts'
  | '1500-Advances & Commissions'
  | '1510-Salesman Account'
  | '1520-Staff Account'
  | '1220-Furniture & Fixtures'
  | '2000-Liabilities'
  | '2100-Capital'
  | '2200-Current Liabilities'
  | '2210-Purchase Party'
  | '2220-Advance Exp.'
  | '2230-Loan'
  | '2300-Other'
  | '2400-Salesman Account'
  | '2500-Bismillah'
  | '3100-Share Capital'
  | '2110-AccountsPayable'
  | '2120-AccuredExpenses'
  | '2200-Long-Term Liabilites'
  | '2210-Bank Loan'
  | '3000-Equity'
  | "3100-Owner's Equity"
  | '3200-Retained Earnings'
  | '4000-Revenue'
  | '4100-Sales Control Account'
  | '4110-Sales'
  | '4200-Service Revenue'
  | '5000-Expenses'
  | '5100-Operating Expenses'
  | '5110-Salaries'
  | '5120-Rent'
  | '5130-Utilities'
  | '5140-Depreciation'
  | '5100-Administrative Expenses'
  | '5200-Selling Expenses'
  | '5210-Advertising'
  | '5220-Sales Commission'
  | '5300-Financial Charges'
  | '5320-Interest Charges'
  | '5310-Bank Charges'
  | '5400-Other Charges'
  | '5500-Miscellaneous';
export type AccountGroupType = 'Group' | 'Detail';

@Schema({ timestamps: true })
export class ChartOfAccount {
  declare _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  selectedCode: string;

  @Prop()
  selectedAccountType1?: string;

  @Prop()
  selectedAccountType2?: string;

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
  credit?: number;

  @Prop()
  debit?: number;

  @Prop()
  ntn?: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const ChartOfAccountSchema =
  SchemaFactory.createForClass(ChartOfAccount);
