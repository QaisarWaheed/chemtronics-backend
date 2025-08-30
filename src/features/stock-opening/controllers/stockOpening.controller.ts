import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StockopeningService } from '../services/stockopening.service';
import { CreateStockOpeningDto } from '../dto/create-stock-opening-dto';
import { StockOpening } from '../entities/stockopening-entity';

@ApiTags('stockOpening')
@Controller('stockOpening')
export class StockOpeningController {
  constructor(private readonly stockOpeningService: StockopeningService) {}

  @Get('all-stock-openings')
  async getAllStockOpenings(): Promise<StockOpening[] | null> {
    return await this.stockOpeningService.getAllStockOpenings();
  }

  @Get('stock-openings-by/:id')
  async getStockOpeningById(
    @Param('id') id: string,
  ): Promise<StockOpening | null> {
    return await this.stockOpeningService.getStockOpeningById(id);
  }

  @Post('add-stock-opening')
  async createStockOpening(
    @Body() dto: CreateStockOpeningDto,
  ): Promise<StockOpening> {
    return await this.stockOpeningService.createStockOpening(dto);
  }

  @Put('update-stock-opening/:id')
  async updateStockOpening(
    @Param('id') id: string,
    @Body() dto: CreateStockOpeningDto,
  ): Promise<StockOpening | null> {
    return await this.stockOpeningService.updateStockOpening(id, dto);
  }

  @Delete('delete-stock-opening/:id')
  async deleteStockOpening(
    @Param('id') id: string,
  ): Promise<StockOpening | null> {
    return await this.stockOpeningService.deleteStockOpening(id);
  }
}
