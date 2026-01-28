import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StockOpening } from '../entities/stockopening-entity';
import { Model } from 'mongoose';
import { CreateStockOpeningDto } from '../dto/create-stock-opening-dto';
import { REQUEST } from '@nestjs/core';
 
@Injectable({ scope: Scope.REQUEST })
export class StockopeningService {
  constructor(
   @Inject(REQUEST) private readonly req: any,



    @InjectModel(StockOpening.name, 'chemtronics')
    private readonly stockOpeningModel: Model<StockOpening>,
    @InjectModel(StockOpening.name, 'hydroworx')
    private readonly stockOpeningModel2: Model<StockOpening>,
  ) {}

  private getModel(): Model<StockOpening> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx' ? this.stockOpeningModel2 : this.stockOpeningModel;
  }

  async getAllStockOpenings(): Promise<StockOpening[]> {
    const stockOpeningModel = this.getModel();
    return await stockOpeningModel.find().exec();
  }

  async getStockOpeningById(id: string): Promise<StockOpening | null> {
    const stockOpeningModel = this.getModel();
    return await stockOpeningModel.findById(id).exec();
  }

  createStockOpening(dto: CreateStockOpeningDto): Promise<StockOpening> {
    const stockOpeningModel = this.getModel();
    const createdStockOpening = stockOpeningModel.create(dto);
    return createdStockOpening;
  }

  async updateStockOpening(
    id: string,
    dto: CreateStockOpeningDto,
  ): Promise<StockOpening | null> {
    const stockOpeningModel = this.getModel();
    await stockOpeningModel.findByIdAndUpdate(id, dto).exec();
    return await this.getStockOpeningById(id);
  }

  async deleteStockOpening(id: string): Promise<StockOpening | null> {
    const stockOpeningModel = this.getModel();
    const stockOpening = await this.getStockOpeningById(id);
    await stockOpeningModel.findByIdAndDelete(id).exec();
    return stockOpening;
  }
}
