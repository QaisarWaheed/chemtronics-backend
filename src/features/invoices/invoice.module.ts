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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PurchaseInvoice', schema: PurchaseInvoiceSchema },
      { name: 'PurchaseReturn', schema: PurchaseReturnSchema },
      { name: 'SaleInvoice', schema: SaleInvoiceSchema },
      { name: 'SaleReturn', schema: SaleReturnSchema },
    ], 'test'),
    MongooseModule.forFeature([
          { name: 'PurchaseInvoice', schema: PurchaseInvoiceSchema },
      { name: 'PurchaseReturn', schema: PurchaseReturnSchema },
      { name: 'SaleInvoice', schema: SaleInvoiceSchema },
      { name: 'SaleReturn', schema: SaleReturnSchema },
    ], 'hydroworx'),
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
  ],
})
export class InvoiceModule {}
