import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ProductsSchema, { Products } from './entities/product.entity';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Products.name, schema: ProductsSchema },
    ] , 'test',),
    MongooseModule.forFeature([
      { name: Products.name, schema: ProductsSchema },
    ] , 'hydroworx',),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
