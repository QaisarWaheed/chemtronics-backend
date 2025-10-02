import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryChalan } from './entities/delivery-chalan.entity';
import { DeliveryChalanService } from './services/delivery-chalan.service';
import { DeliveryChalanController } from './controllers/delivery-chalan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryChalan])],
  controllers: [DeliveryChalanController],
  providers: [DeliveryChalanService],
  exports: [DeliveryChalanService],
})
export class DeliveryChalanModule {}
