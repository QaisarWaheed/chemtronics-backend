import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './features/products/products.module';
import { StockOpeningModule } from './features/stock-opening/stock-opening.module';
import { ChartOfAccountModule } from './features/ChartOfAccount/chart-of-account.module';
import { InvoiceModule } from './features/invoices/invoice.module';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './features/accounts/accounts.module';
import { DeliveryChalanModule } from './features/deliveryChalan/delivery-chalan.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
        'mongodb+srv://wasifzahoor296_db_user:nukebugs123@cluster0.k1szlzx.mongodb.net/Chemtronics?appName=Cluster0',
      {
        connectionName: 'chemtronics',
      },
    ),
    MongooseModule.forRoot(
      process.env.MONGO_URI2 ??
        'mongodb+srv://wasifzahoor296_db_user:nukebugs123@cluster0.k1szlzx.mongodb.net/Hydroworx?appName=Cluster0',
      {
        connectionName: 'hydroworx',
      },
    ),
    //test
    AuthModule,
    ProductsModule,
    StockOpeningModule,
    InvoiceModule,
    ChartOfAccountModule,
    AccountsModule,
    DeliveryChalanModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
