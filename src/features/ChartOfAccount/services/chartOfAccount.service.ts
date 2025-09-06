import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChartOfAccount } from '../entities/chartOfAccount.entity';
import { CreateChartOfAccountDto } from '../dto/createChartOfAccount.dto';
import { UpdateChartOfAccountDto } from '../dto/updateChartOfAccount.dto';

@Injectable()
export class ChartOfAccountService {
  constructor(
    @InjectModel(ChartOfAccount.name)
    private chartOfAccountModel: Model<ChartOfAccount>,
  ) {}

  async create(createChartOfAccountDto: CreateChartOfAccountDto) {
    const created = new this.chartOfAccountModel(createChartOfAccountDto);
    return created.save();
  }

  async findAll() {
    return this.chartOfAccountModel.find().exec();
  }

  async findOne(id: string) {
    return this.chartOfAccountModel.findById(id).exec();
  }

  async update(id: string, updateChartOfAccountDto: UpdateChartOfAccountDto) {
    return this.chartOfAccountModel
      .findByIdAndUpdate(id, updateChartOfAccountDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.chartOfAccountModel.findByIdAndDelete(id).exec();
  }
}
