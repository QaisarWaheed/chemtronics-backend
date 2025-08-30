import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { AuthController } from './features/auth/controllers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './features/products/products.module';
import { StockOpeningModule } from './features/stock-opening/stock-opening.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/chemtronics'),
    AuthModule,
    ProductsModule,
    StockOpeningModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
