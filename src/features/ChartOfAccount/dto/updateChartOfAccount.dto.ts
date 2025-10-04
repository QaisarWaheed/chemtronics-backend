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
      '1110-CashInHands',
      '1120-CashAtBank',
      '1130-AccountsReceiveable',
      '1200-fixedAssets',
      '1220-Furniture & fixtures',
      '2000-Liabilities',
      '2100-current Liabilities',
      '2110-AccountsPayable',
      '2120-AccuredExpenses',
      '2200-Long-Term Liabilites',
      '2210-Bank Loan',
      '300-Equity',
      "3100-Owner's Equity",
      '3200-Retained Earnings',
      '4000-Revenue',
      '4100-sales revenue',
      '4200-serviceRevenue',
      '5000-Expenses',
      '5100-operating Expenses',
      '5110-salaries & wages',
      '5120-Rent Expense',
      '5130-Utilities',
      '5200- administrative expenses',
      '5210-office supplies',
      '5220-professional fees',
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
  phoneNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  salesTaxNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ntn?: string;
}
