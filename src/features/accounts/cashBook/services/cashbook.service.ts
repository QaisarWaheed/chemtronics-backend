import { Injectable, BadRequestException, Inject, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cashbook, EntryType } from '../entities/cashbook.entity';
import { CreateCashbookDto } from '../dtos/CreateCashbook.dto';
import { REQUEST } from '@nestjs/core';

function parseMMDDYYYY(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateStr))
    throw new BadRequestException('Date must be in mm/dd/yyyy format');
  const [month, day, year] = dateStr.split('/');
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return new Date(`${year}-${paddedMonth}-${paddedDay}`);
}

@Injectable({ scope: Scope.REQUEST })
export class CashbookService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(Cashbook.name, 'test') private cashbookModel: Model<Cashbook>,
    @InjectModel(Cashbook.name, 'hydroworx') private cashbookModel2: Model<Cashbook>,
  ) {}
      
      

       private getModel(): Model<Cashbook> {
        const brand = this.req['brand'] || 'test';
        return brand === 'hydroworx' ? this.cashbookModel2 : this.cashbookModel;
      }
    

  async create(createCashbookDto: CreateCashbookDto) {
    const cashbookModel = this.getModel();
    return await cashbookModel.create(createCashbookDto);
  }

  async getAllcashBookEntries() {
    const cashbookModel = this.getModel();
    return await cashbookModel.find().exec();
  }

  async getTotalAmount(amount: number) {
    const cashbookModel = this.getModel();
    if (isNaN(amount) || amount < 0) {
      throw new BadRequestException('Amount must be a positive number');
    }
    const result = await cashbookModel.findOne({ amount }).exec();
    if (!result) {
      throw new BadRequestException('Cashbook entry not found');
    }
    return result;
  }

  async findAll(filters?: {
    entryType?: EntryType;
    startDate?: string;
    endDate?: string;
  }) {
    const cashbookModel = this.getModel();
    const query: any = {};
    if (filters?.entryType) query.entryType = filters.entryType;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filters?.startDate) {
      
      startDate = parseMMDDYYYY(filters.startDate);
      if (!startDate) throw new BadRequestException('Invalid start date');
      startDate.setHours(0, 0, 0, 0); // Start of day
    }
    if (filters?.endDate) {
      endDate = parseMMDDYYYY(filters.endDate);
      if (!endDate) throw new BadRequestException('Invalid end date');
      endDate.setHours(23, 59, 59, 999); // End of day
    }

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }
    return await cashbookModel.find(query).exec();
  }
}
