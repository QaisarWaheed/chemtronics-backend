import { Test, TestingModule } from '@nestjs/testing';
import { StockOpeningController } from './stockOpening.controller';

describe('StockOpeningControllerController', () => {
  let controller: StockOpeningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockOpeningController],
    }).compile();

    controller = module.get<StockOpeningController>(StockOpeningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
