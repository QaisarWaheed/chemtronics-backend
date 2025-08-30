import { ApiProperty } from '@nestjs/swagger';

export class CreateStockOpeningDto {
  @ApiProperty()
  product: string;

  @ApiProperty()
  openingDate: Date;

  @ApiProperty()
  costPerUnit: number;

  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  openingQuantity: number;
}
