/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  Res,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { SaleInvoiceService } from '../services/saleInvoice.service';
import { CreateSaleInvoiceDto } from '../dto/createSaleInvoice.dto';
import { UpdateSaleInvoiceDto } from '../dto/updateSaleInvoice.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PdfService } from '../services/pdf.service';
import type { Request, Response } from 'express';

@ApiTags('Sale Invoice')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sale-invoice')
export class SaleInvoiceController {
  constructor(
    private readonly saleInvoiceService: SaleInvoiceService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  create(@Body() createSaleInvoiceDto: CreateSaleInvoiceDto) {
    return this.saleInvoiceService.create(createSaleInvoiceDto);
  }

  @Get()
  findAll() {
    return this.saleInvoiceService.findAll();
  }

  @Get('search')
  search(@Query('q') searchTerm?: string) {
    return this.saleInvoiceService.search(searchTerm);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const invoice = await this.saleInvoiceService.findOne(id);
    if (!invoice) throw new NotFoundException(`Sale invoice not found: ${id}`);

    const brand = (req as any)['brand'] ?? 'chemtronics';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
    );

    const doc = this.pdfService.generateSaleInvoicePdf(invoice as any, brand);
    doc.pipe(res);
    doc.end();
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
  /**
   * Convert a DeliveryChalan to a SaleInvoice
   * @param deliveryChallanId DeliveryChalan Mongo _id or id
   */
  @Post('convert/:deliveryChallanId')
  async convertFromDeliveryChallan(
    @Param('deliveryChallanId') deliveryChallanId: string,
  ) {
    return this.saleInvoiceService.convertFromDeliveryChallan(
      deliveryChallanId,
    );
  }
}
