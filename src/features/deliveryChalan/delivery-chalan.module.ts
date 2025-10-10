import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import DeliveryChalanSchema, { DeliveryChalan } from './entities/delivery-chalan.entity';
import { DeliveryChalanService } from './services/delivery-chalan.service';
import { DeliveryChalanController } from './controllers/delivery-chalan.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'DeliveryChalan', schema: DeliveryChalanSchema }], 'chemtronics'),
  MongooseModule.forFeature([{ name: 'DeliveryChalan', schema: DeliveryChalanSchema }], 'hydroworx')
],

  controllers: [DeliveryChalanController],
  providers: [DeliveryChalanService],
  exports: [DeliveryChalanService],
})
export class DeliveryChalanModule {}
