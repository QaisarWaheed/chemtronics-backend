import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSaleReturnDto {
  @ApiProperty()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  invoiceDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  customer: string;

  @ApiProperty()
  @IsNotEmpty()
  customerTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  saleAccount: string;

  @ApiProperty()
  @IsNotEmpty()
  saleTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  salesman: string;

  @ApiProperty({ type: [Object] })
  @IsNotEmpty()
  products: Array<{
    code: number;
    productName: string;
    unit: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    discountPercent: number;
    discount: number;
    netAmount: number;
  }>;
}
