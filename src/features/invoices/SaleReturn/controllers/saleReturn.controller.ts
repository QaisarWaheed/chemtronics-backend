import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SaleReturnService } from '../services/saleReturn.service';
import { CreateSaleReturnDto } from '../dto/createSaleReturn.dto';
import { UpdateSaleReturnDto } from '../dto/updateSaleReturn.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sale Return')
@Controller('sale-return')
export class SaleReturnController {
  constructor(private readonly saleReturnService: SaleReturnService) {}

  @Post()
  create(@Body() createSaleReturnDto: CreateSaleReturnDto) {
    return this.saleReturnService.create(createSaleReturnDto);
  }

  @Get()
  findAll() {
    return this.saleReturnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleReturnService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleReturnDto: UpdateSaleReturnDto,
  ) {
    return this.saleReturnService.update(id, updateSaleReturnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleReturnService.remove(id);
  }
}
