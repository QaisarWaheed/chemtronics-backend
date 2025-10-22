/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import type {
  AccountType,
  ParentAccount,
  AccountGroupType,
} from '../entities/chartOfAccount.entity';

export class UpdateChartOfAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  selectedCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  selectedAccountType1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  selectedAccountType2?: string;

  @ApiProperty()
  @IsNotEmpty()
  accountCode: string;

  @ApiProperty()
  @IsNotEmpty()
  level: string;

  @ApiProperty()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] })
  @IsNotEmpty()
  accountType: AccountType;

  @ApiProperty({
    enum: [
      '1000-Assets',
      '1100-Current-Assets',
      '1110-Cash',
      '1120-Bank Accounts',
      '1130-Other Current Assets',
      '1200-Fixed Assets',
      '1300-Inventories',
      '1400-Receivables',
      '1410-Receivables Accounts',
      '1500-Advances & Commissions',
      '1510-Salesman Account',
      '1220-Furniture & Fixtures',
      '2000-Liabilities',
      '2100-Capital',
      '2200-Current Liabilities',
      '2210-Purchase Party',
      '2220-Advance Exp.',
      '2300-Other',
      '2400-Salesman Account',
      '2500-Bismillah',
      '3100-Share Capital',
      '2110-AccountsPayable',
      '2120-AccuredExpenses',
      '2200-Long-Term Liabilites',
      '2210-Bank Loan',
      '3000-Equity',
      "3100-Owner's Equity",
      '3200-Retained Earnings',
      '4000-Revenue',
      '4100-Sales Control Account',
      '4110-Sales',
      '4200-Service Revenue',
      '5000-Expenses',
      '5100-Operating Expenses',
      '5110-Salaries',
      '5120-Rent',
      '5130-Utilities',
      '5140-Depreciation',
      '5100-Administrative Expenses',
      '5200-Selling Expenses',
      '5210-Advertising',
      '5220-Sales Commission',
      '5300-Financial Charges',
      '5320-Interest Charges',
      '5310-Bank Charges',
      '5400-Other Charges',
      '5500-Miscellaneous',
    ],
  })
  @IsNotEmpty()
  parentAccount: ParentAccount;

  @ApiProperty({ enum: ['Group', 'Detail'] })
  @IsNotEmpty()
  type: AccountGroupType;

  @ApiProperty({ default: false })
  @IsBoolean()
  isParty: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  credit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  debit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  phoneNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  salesTaxNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ntn?: string;
}
