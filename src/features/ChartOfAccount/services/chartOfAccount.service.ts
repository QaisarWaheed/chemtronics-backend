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
    const brand = this.getBrand();
    return this.getModel(brand).find({ accountType }).exec();
  }
  async findSalesAccounts() {
    const brand = this.getBrand();
    const salesAccounts = await this.getModel(brand)
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

  private getBrand(): string {
    const brand = ((this.req['brand'] as string) || 'chemtronics')
      .toLowerCase()
      .trim();
    console.log('Incoming Header x-brand:', brand);
    return brand;
  }

  private getModel(brand: string): Model<ChartOfAccount> {
    const model =
      brand === 'hydroworx'
        ? this.chartOfAccountModel2
        : this.chartOfAccountModel;
    console.log(
      'Switching Model. Brand:',
      brand,
      '| Connection DB:',
      model.db.name,
    );
    return model;
  }

  async create(createChartOfAccountDto: CreateChartOfAccountDto) {
    const brand = this.getBrand();
    const chartOfAccountModel = this.getModel(brand);
    const created = new chartOfAccountModel(createChartOfAccountDto);
    await created.save();
    return created;
  }

  async findAll() {
    const brand = this.getBrand();
    const chartOfAccountModel = this.getModel(brand);
    return chartOfAccountModel.find().exec();
  }

  async findOne(id: string) {
    const brand = this.getBrand();
    const chartOfAccountModel = this.getModel(brand);
    return chartOfAccountModel.findById(id).exec();
  }

  async update(id: string, updateChartOfAccountDto: UpdateChartOfAccountDto) {
    const brand = this.getBrand();
    const chartOfAccountModel = this.getModel(brand);
    return chartOfAccountModel
      .findByIdAndUpdate(id, updateChartOfAccountDto, { new: true })
      .exec();
  }

  async updateOpeningBalance(id: string, debit: number, credit: number) {
    const brand = this.getBrand();
    const chartOfAccountModel = this.getModel(brand);
    return chartOfAccountModel
      .findByIdAndUpdate(id, { debit: debit, credit: credit }, { new: true })
      .exec();
  }

  async remove(id: string) {
    const brand = this.getBrand();
    const chartOfAccountModel = this.getModel(brand);
    const deleted = await chartOfAccountModel.findByIdAndDelete(id).exec();
    return deleted;
  }
}
