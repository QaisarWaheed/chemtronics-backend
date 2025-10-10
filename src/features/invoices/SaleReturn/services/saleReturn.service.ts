import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaleReturn } from '../entities/saleReturn.entity';
import { CreateSaleReturnDto } from '../dto/createSaleReturn.dto';
import { UpdateSaleReturnDto } from '../dto/updateSaleReturn.dto';
import { REQUEST } from '@nestjs/core';


@Injectable({ scope: Scope.REQUEST })
export class SaleReturnService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(SaleReturn.name, 'test') private saleReturnModel: Model<SaleReturn>,
    @InjectModel(SaleReturn.name, 'hydroworx') private saleReturnModel2: Model<SaleReturn>,
  ) {}


  private getModel(): Model<SaleReturn> {
    const brand = this.req['brand'] || 'test';
    return brand === 'hydroworx' ? this.saleReturnModel2 : this.saleReturnModel;
  }


  async create(createSaleReturnDto: CreateSaleReturnDto) {
    const saleReturnModel = this.getModel();
    const created = new saleReturnModel(createSaleReturnDto);
    return created.save();
  }

  async findAll() {
    const saleReturnModel = this.getModel();
    return saleReturnModel.find().exec();
  }

  async findOne(id: string) {
    const saleReturnModel = this.getModel();
    return saleReturnModel.findById(id).exec();
  }

  async update(id: string, updateSaleReturnDto: UpdateSaleReturnDto) {
    const saleReturnModel = this.getModel();
    return saleReturnModel
      .findByIdAndUpdate(id, updateSaleReturnDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    const saleReturnModel = this.getModel();
    return saleReturnModel.findByIdAndDelete(id).exec();
  }
}
