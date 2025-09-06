import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PurchaseInvoiceService } from '../services/PurchaseInvoice';
import { CreatePurchaseInvoiceDto } from '../dto/createPurchaseInvoice.dto';
import { UpdatePurchaseInvoiceDto } from '../dto/updatePurchaseInvoice.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Purchase Invoice')
@Controller('purchase-invoice')
export class PurchaseInvoiceController {
  constructor(
    private readonly purchaseInvoiceService: PurchaseInvoiceService,
  ) {}

  @Get('/all-purchase-invoices')
  async getAllPurchaseInvoices() {
    return this.purchaseInvoiceService.getAllPurchaseInvoices();
  }

  @Post('/create-purchase-invoice')
  async createPurchaseInvoice(@Body() data: CreatePurchaseInvoiceDto) {
    try {
      return await this.purchaseInvoiceService.createPurchaseInvoice(data);
    } catch (error) {
      throw new Error(`Failed to create purchase invoice: ${error.message}`);
    }
  }

  @Get('/purchase-invoice/:id')
  async getPurchaseInvoiceById(@Param('id') id: string) {
    return this.purchaseInvoiceService.getPurchaseInvoiceById(id);
  }

  @Put('/update-purchase-invoice/:id')
  async updatePurchaseInvoice(
    @Param('id') id: string,
    @Body() data: UpdatePurchaseInvoiceDto,
  ) {
    return this.purchaseInvoiceService.updatePurchaseInvoice(id, data);
  }

  @Delete('/delete-purchase-invoice/:id')
  async deletePurchaseInvoice(@Param('id') id: string) {
    return this.purchaseInvoiceService.deletePurchaseInvoice(id);
  }
}
