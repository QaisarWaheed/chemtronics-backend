/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './features/products/products.module';
import { StockOpeningModule } from './features/stock-opening/stock-opening.module';
import { ChartOfAccountModule } from './features/ChartOfAccount/chart-of-account.module';
import { InvoiceModule } from './features/invoices/invoice.module';
import { AccountsModule } from './features/accounts/accounts.module';
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? '', {
      connectionName: 'test',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI2 ?? '', {
      connectionName: 'hydroworx',
    }),
    AuthModule,
    ProductsModule,
    StockOpeningModule,
    InvoiceModule,
    ChartOfAccountModule,
    AccountsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
