import { Module } from '@nestjs/common';
import { PurchaseInvoiceService } from './purchaseInvoice/services/PurchaseInvoice';
import { PurchaseInvoiceController } from './purchaseInvoice/controllers/purchase-invoice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseInvoiceSchema } from './purchaseInvoice/entities/purchaseInvoice.entity';
import { PurchaseReturnSchema } from './PurchaseReturn/entities/purchaseReturn.entity';
import { PurchaseReturnService } from './PurchaseReturn/services/purchaseReturn.service';
import { PurchaseReturnController } from './PurchaseReturn/controllers/purchaseReturn.controller';
import { SaleInvoiceService } from './SaleInvoice/services/saleInvoice.service';
import { SaleInvoiceController } from './SaleInvoice/controllers/saleInvoice.controller';
import { SaleInvoiceSchema } from './SaleInvoice/entities/saleInvoice.entity';
import { SaleReturnSchema } from './SaleReturn/entities/saleReturn.entity';
import { SaleReturnController } from './SaleReturn/controllers/saleReturn.controller';
import { SaleReturnService } from './SaleReturn/services/saleReturn.service';
import ProductsSchema, { Products } from '../products/entities/product.entity';
import {
  JournalVoucher,
  JournalVoucherSchema,
} from '../accounts/journalVoucher/entities/journal-voucher/journal-voucher';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { PdfService } from './SaleInvoice/services/pdf.service';
import DeliveryChalanSchema, { DeliveryChalan } from '../deliveryChalan/entities/delivery-chalan.entity';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: 'PurchaseInvoice', schema: PurchaseInvoiceSchema },
        { name: 'PurchaseReturn', schema: PurchaseReturnSchema },
        { name: 'SaleInvoice', schema: SaleInvoiceSchema },
        { name: 'SaleReturn', schema: SaleReturnSchema },
        { name: Products.name, schema: ProductsSchema },
        { name: JournalVoucher.name, schema: JournalVoucherSchema },
        { name: 'DeliveryChalan', schema: DeliveryChalanSchema },
      ],
      'chemtronics',
    ),
    MongooseModule.forFeature(
      [
        { name: 'PurchaseInvoice', schema: PurchaseInvoiceSchema },
        { name: 'PurchaseReturn', schema: PurchaseReturnSchema },
        { name: 'SaleInvoice', schema: SaleInvoiceSchema },
        { name: 'SaleReturn', schema: SaleReturnSchema },
        { name: Products.name, schema: ProductsSchema },
        { name: JournalVoucher.name, schema: JournalVoucherSchema },
        { name: 'DeliveryChalan', schema: DeliveryChalanSchema },
      ],
      'hydroworx',
    ),
    AuditLogModule,
  ],
  controllers: [
    PurchaseInvoiceController,
    PurchaseReturnController,
    SaleInvoiceController,
    SaleReturnController,
  ],
  providers: [
    PurchaseInvoiceService,
    PurchaseReturnService,
    SaleInvoiceService,
    SaleReturnService,
    PdfService,
  ],
})
export class InvoiceModule {}
