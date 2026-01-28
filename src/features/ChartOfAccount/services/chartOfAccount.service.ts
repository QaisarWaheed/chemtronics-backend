/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChartOfAccount } from '../entities/chartOfAccount.entity';
import { CreateChartOfAccountDto } from '../dto/createChartOfAccount.dto';
import { UpdateChartOfAccountDto } from '../dto/updateChartOfAccount.dto';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
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
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(ChartOfAccount.name, 'chemtronics')
    private chartOfAccountModel: Model<ChartOfAccount>,
    @InjectModel(ChartOfAccount.name, 'hydroworx')
    private chartOfAccountModel2: Model<ChartOfAccount>,
  ) {}

  private getModel(): Model<ChartOfAccount> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx'
      ? this.chartOfAccountModel2
      : this.chartOfAccountModel;
  }

  async create(createChartOfAccountDto: CreateChartOfAccountDto) {
    const chartOfAccountModel = this.getModel();
    const created = new chartOfAccountModel(createChartOfAccountDto);
    await created.save();
    return created;
  }

  async findAll() {
    const chartOfAccountModel = this.getModel();
    return chartOfAccountModel.find().exec();
  }

  async findOne(id: string) {
    const chartOfAccountModel = this.getModel();
    return chartOfAccountModel.findById(id).exec();
  }

  async update(id: string, updateChartOfAccountDto: UpdateChartOfAccountDto) {
    const chartOfAccountModel = this.getModel();
    return chartOfAccountModel
      .findByIdAndUpdate(id, updateChartOfAccountDto, { new: true })
      .exec();
  }

  async updateOpeningBalance(id: string, debit: number, credit: number) {
    const chartOfAccountModel = this.getModel();
    return chartOfAccountModel
      .findByIdAndUpdate(id, { debit: debit, credit: credit }, { new: true })
      .exec();
  }

  async remove(id: string) {
    const chartOfAccountModel = this.getModel();
    const deleted = await chartOfAccountModel.findByIdAndDelete(id).exec();
    return deleted;
  }
}
