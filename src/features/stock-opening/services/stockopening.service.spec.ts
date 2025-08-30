import { Test, TestingModule } from '@nestjs/testing';
import { StockopeningService } from './stockopening.service';

describe('StockopeningService', () => {
  let service: StockopeningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockopeningService],
    }).compile();

    service = module.get<StockopeningService>(StockopeningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
