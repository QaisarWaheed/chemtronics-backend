import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChartOfAccount } from '../entities/chartOfAccount.entity';
import { CreateChartOfAccountDto } from '../dto/createChartOfAccount.dto';
import { UpdateChartOfAccountDto } from '../dto/updateChartOfAccount.dto';

@Injectable()
export class ChartOfAccountService {
  async findByAccountType(accountType: string) {
    return this.chartOfAccountModel.find({ accountType }).exec();
  }
  async findSalesAccounts() {
    const salesAccounts = await this.chartOfAccountModel
      .find({ accountType: 'sales' })
      .exec();
    return salesAccounts.map((acc) => ({
      SaleAccount: acc.accountCode,
      SaleAccountTitle: acc.accountName,
      _id: acc._id,
    }));
  }
  constructor(
    @InjectModel(ChartOfAccount.name)
    private chartOfAccountModel: Model<ChartOfAccount>,
  ) {}

  async create(createChartOfAccountDto: CreateChartOfAccountDto) {
    const created = new this.chartOfAccountModel(createChartOfAccountDto);
    await created.save();
    return created;
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
    const deleted = await this.chartOfAccountModel.findByIdAndDelete(id).exec();
    return deleted;
  }
}
