/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, Inject, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JournalVoucher } from '../../entities/journal-voucher/journal-voucher';
import { CreateJournalVoucherDto } from '../../dtos/create-journal-voucher/create-journal-voucher.dto';
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
export class JournalvoucherService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(JournalVoucher.name, 'test')
    private journalVoucherModel: Model<JournalVoucher>,
    @InjectModel(JournalVoucher.name, 'hydroworx')
    private journalVoucherModel2: Model<JournalVoucher>,
  ) {}

  private getModel(): Model<JournalVoucher> {
    const brand = this.req['brand'] || 'test';
    return brand === 'hydroworx'
      ? this.journalVoucherModel2
      : this.journalVoucherModel;
  }

  async create(
    createJournalVoucherDto:
      | CreateJournalVoucherDto
      | CreateJournalVoucherDto[],
  ) {
    const model = this.getModel();
    if (Array.isArray(createJournalVoucherDto)) {
      // Insert multiple documents in a single operation
      const newEntry = await model.insertMany(createJournalVoucherDto);

      return newEntry;
    }
    const newEntry = await model.create(createJournalVoucherDto);
    return newEntry;
  }

  async findAll(filters?: { startDate?: string; endDate?: string }) {
    const model = this.getModel();
    const query: any = {};
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filters?.startDate) {
      startDate = parseMMDDYYYY(filters.startDate);
      if (!startDate) throw new BadRequestException('Invalid start date');
      startDate.setHours(0, 0, 0, 0);
    }
    if (filters?.endDate) {
      endDate = parseMMDDYYYY(filters.endDate);
      if (!endDate) throw new BadRequestException('Invalid end date');
      endDate.setHours(23, 59, 59, 999);
    }
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }
    // use .lean() so we return plain JS objects with all stored fields
    return await model.find(query).lean().exec();
  }

  async findByVoucherNumber(voucherNumber: string) {
    const model = this.getModel();
    return await model.findOne({ voucherNumber }).lean().exec();
  }

  async remove(id: string) {
    const model = this.getModel();
    // Validate id
    if (!id) throw new BadRequestException('ID is required');
    const result = await model.findByIdAndDelete(id).lean().exec();
    if (!result) throw new BadRequestException('Journal voucher not found');
    return result;
  }
}
