import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SaleInvoiceService } from '../services/saleInvoice.service';
import { CreateSaleInvoiceDto } from '../dto/createSaleInvoice.dto';
import { UpdateSaleInvoiceDto } from '../dto/updateSaleInvoice.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sale Invoice')
@Controller('sale-invoice')
export class SaleInvoiceController {
  constructor(private readonly saleInvoiceService: SaleInvoiceService) {}

  @Post()
  create(@Body() createSaleInvoiceDto: CreateSaleInvoiceDto) {
    return this.saleInvoiceService.create(createSaleInvoiceDto);
  }

  @Get()
  findAll() {
    return this.saleInvoiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleInvoiceService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleInvoiceDto: UpdateSaleInvoiceDto,
  ) {
    return this.saleInvoiceService.update(id, updateSaleInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleInvoiceService.remove(id);
  }
}
