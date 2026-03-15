import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './features/products/products.module';
import { StockOpeningModule } from './features/stock-opening/stock-opening.module';
import { ChartOfAccountModule } from './features/ChartOfAccount/chart-of-account.module';
import { InvoiceModule } from './features/invoices/invoice.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountsModule } from './features/accounts/accounts.module';
import { DeliveryChalanModule } from './features/deliveryChalan/delivery-chalan.module';
import { ReportsModule } from './features/reports/reports.module';
import { AuditLogModule } from './features/audit-log/audit-log.module';
import {
  getChemtronicsMongoUri,
  getHydroworxMongoUri,
} from './config/runtime-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      connectionName: 'chemtronics',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: getChemtronicsMongoUri(configService),
      }),
    }),
    MongooseModule.forRootAsync({
      connectionName: 'hydroworx',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: getHydroworxMongoUri(configService),
      }),
    }),
    //test
    AuthModule,
    ProductsModule,
    StockOpeningModule,
    InvoiceModule,
    ChartOfAccountModule,
    AccountsModule,
    DeliveryChalanModule,
    ReportsModule,
    AuditLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
