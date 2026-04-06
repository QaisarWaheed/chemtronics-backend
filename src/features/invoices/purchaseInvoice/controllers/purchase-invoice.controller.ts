import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PurchaseInvoiceService } from '../services/PurchaseInvoice';
import { CreatePurchaseInvoiceDto } from '../dto/createPurchaseInvoice.dto';
import { UpdatePurchaseInvoiceDto } from '../dto/updatePurchaseInvoice.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Purchase Invoice')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-invoice')
export class PurchaseInvoiceController {
  constructor(
    private readonly purchaseInvoiceService: PurchaseInvoiceService,
  ) {}

  @Get('/all-purchase-invoices')
  async getAllPurchaseInvoices() {
    return this.purchaseInvoiceService.getAllPurchaseInvoices();
  }

  @Get('search')
  async search(@Query('q') searchTerm?: string) {
    return this.purchaseInvoiceService.search(searchTerm);
  }

  @Post('/create-purchase-invoice')
  async createPurchaseInvoice(@Body() data: CreatePurchaseInvoiceDto) {
    try {
      return await this.purchaseInvoiceService.createPurchaseInvoice(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create purchase invoice: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
