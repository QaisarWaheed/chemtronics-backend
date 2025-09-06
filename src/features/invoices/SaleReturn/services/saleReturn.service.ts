import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaleReturn } from '../entities/saleReturn.entity';
import { CreateSaleReturnDto } from '../dto/createSaleReturn.dto';
import { UpdateSaleReturnDto } from '../dto/updateSaleReturn.dto';

@Injectable()
export class SaleReturnService {
  constructor(
    @InjectModel(SaleReturn.name) private saleReturnModel: Model<SaleReturn>,
  ) {}

  async create(createSaleReturnDto: CreateSaleReturnDto) {
    const created = new this.saleReturnModel(createSaleReturnDto);
    return created.save();
  }

  async findAll() {
    return this.saleReturnModel.find().exec();
  }

  async findOne(id: string) {
    return this.saleReturnModel.findById(id).exec();
  }

  async update(id: string, updateSaleReturnDto: UpdateSaleReturnDto) {
    return this.saleReturnModel
      .findByIdAndUpdate(id, updateSaleReturnDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.saleReturnModel.findByIdAndDelete(id).exec();
  }
}
