import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StockOpening } from '../entities/stockopening-entity';
import { Model } from 'mongoose';
import { CreateStockOpeningDto } from '../dto/create-stock-opening-dto';
//getall stock openings, get stock opening by id, update stock opening, delete stock opening
//await all requests
@Injectable()
export class StockopeningService {
  constructor(
    @InjectModel(StockOpening.name)
    private readonly stockOpeningModel: Model<StockOpening>,
  ) {}

  async getAllStockOpenings(): Promise<StockOpening[]> {
    return await this.stockOpeningModel.find().exec();
  }

  async getStockOpeningById(id: string): Promise<StockOpening | null> {
    return await this.stockOpeningModel.findById(id).exec();
  }

  createStockOpening(dto: CreateStockOpeningDto): Promise<StockOpening> {
    const createdStockOpening = this.stockOpeningModel.create(dto);
    return createdStockOpening;
  }

  async updateStockOpening(
    id: string,
    dto: CreateStockOpeningDto,
  ): Promise<StockOpening | null> {
    await this.stockOpeningModel.findByIdAndUpdate(id, dto).exec();
    return await this.getStockOpeningById(id);
  }

  async deleteStockOpening(id: string): Promise<StockOpening | null> {
    const stockOpening = await this.getStockOpeningById(id);
    await this.stockOpeningModel.findByIdAndDelete(id).exec();
    return stockOpening;
  }
}
