import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashbookController } from './cashBook/controllers/cashbook.controller';
import { Cashbook, CashbookSchema } from './cashBook/entities/cashbook.entity';
import { CashbookService } from './cashBook/services/cashbook.service';

import {
  JournalVoucher,
  JournalVoucherSchema,
} from './journalVoucher/entities/journal-voucher/journal-voucher';
import { JournalvoucherService } from './journalVoucher/services/journalvoucher/journalvoucher.service';
import { JournalVoucherController } from './journalVoucher/journal-voucher/journal-voucher.controller';
@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Cashbook.name, schema: CashbookSchema },
        { name: JournalVoucher.name, schema: JournalVoucherSchema },
      ],
      'test',
    ),
    MongooseModule.forFeature(
      [
        { name: Cashbook.name, schema: CashbookSchema },
        { name: JournalVoucher.name, schema: JournalVoucherSchema },
      ],
      'hydroworx',
    ),
  ],
  controllers: [CashbookController, JournalVoucherController],
  providers: [CashbookService, JournalvoucherService],
})
export class AccountsModule {}
