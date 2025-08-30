import { Module } from '@nestjs/common';
import { StockopeningService } from './services/stockopening.service';
import { StockOpeningController } from './controllers/stockOpening.controller';
import { MongooseModule } from '@nestjs/mongoose';
import StockopeningSchema, {
  StockOpening,
} from './entities/stockopening-entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockOpening.name, schema: StockopeningSchema },
    ]),
  ],
  controllers: [StockOpeningController],
  providers: [StockopeningService],
})
export class StockOpeningModule {}
