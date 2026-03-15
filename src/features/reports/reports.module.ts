import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JournalVoucher,
  JournalVoucherSchema,
} from '../accounts/journalVoucher/entities/journal-voucher/journal-voucher';
import { SaleInvoiceSchema } from '../invoices/SaleInvoice/entities/saleInvoice.entity';
import ProductsSchema, { Products } from '../products/entities/product.entity';
import { ChartOfAccountSchema } from '../ChartOfAccount/entities/chartOfAccount.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './controllers/reports.controller';
import { PdfService } from '../invoices/SaleInvoice/services/pdf.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: JournalVoucher.name, schema: JournalVoucherSchema },
        { name: 'SaleInvoice', schema: SaleInvoiceSchema },
        { name: Products.name, schema: ProductsSchema },
        { name: 'ChartOfAccount', schema: ChartOfAccountSchema },
      ],
      'chemtronics',
    ),
    MongooseModule.forFeature(
      [
        { name: JournalVoucher.name, schema: JournalVoucherSchema },
        { name: 'SaleInvoice', schema: SaleInvoiceSchema },
        { name: Products.name, schema: ProductsSchema },
        { name: 'ChartOfAccount', schema: ChartOfAccountSchema },
      ],
      'hydroworx',
    ),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, PdfService],
})
export class ReportsModule {}
