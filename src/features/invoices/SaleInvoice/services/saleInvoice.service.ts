import { Inject, Injectable, Scope, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaleInvoice } from '../entities/saleInvoice.entity';
import { CreateSaleInvoiceDto } from '../dto/createSaleInvoice.dto';
import { UpdateSaleInvoiceDto } from '../dto/updateSaleInvoice.dto';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class SaleInvoiceService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(SaleInvoice.name, 'chemtronics') private saleInvoiceModel: Model<SaleInvoice>,
    @InjectModel(SaleInvoice.name, 'hydroworx') private saleInvoiceModel2: Model<SaleInvoice>,
  ) {}

  private getModel(): Model<SaleInvoice> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx' ? this.saleInvoiceModel2 : this.saleInvoiceModel;
  }

  async create(createSaleInvoiceDto: CreateSaleInvoiceDto) {
    const saleInvoiceModel = this.getModel();

    // Enforce business rule: hydroworx invoices should have no tax
    const brand = this.req['brand'] || 'chemtronics';
    const payload = { ...createSaleInvoiceDto } as any;
    if (brand === 'hydroworx' && Array.isArray(payload.products)) {
      payload.products = payload.products.map((p: any) => {
        const qty = Number(p.quantity) || 0;
        const rate = Number(p.rate) || 0;
        const exGstAmount = qty * rate;
        return {
          ...p,
          gstPercent: 0,
          exGstRate: 0,
          exGstAmount: exGstAmount,
          netAmount: exGstAmount,
        };
      });
      // Recalculate invoice totals
      payload.netAmount = payload.products.reduce(
        (s: number, it: any) => s + (Number(it.netAmount) || 0),
        0,
      );
      payload.amount = payload.netAmount;
    }

    // Normalize payload fields to match schema
    // DTOs/clients may send `account` but schema expects `accountNumber`
    if (payload.account && !payload.accountNumber) {
      payload.accountNumber = payload.account;
    }

    // Persist and provide clearer error messages for validation/duplicates
    try {
      const created = new saleInvoiceModel(payload);
      return await created.save();
    } catch (error: any) {
      console.error('SaleInvoiceService.create error:', error);
      if (error && error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      if (error && error.code === 11000) {
        // duplicate key, likely invoiceNumber
        throw new BadRequestException('Duplicate key error: possible duplicate invoiceNumber');
      }
      // Surface the original message to the response (kept brief)
      throw new InternalServerErrorException(error?.message || 'Failed to create sale invoice');
    }
  }

  async findAll() {
    const saleInvoiceModel = this.getModel();
    return saleInvoiceModel.find().exec();
  }

  async findOne(id: string) {
    const saleInvoiceModel = this.getModel();
    return saleInvoiceModel.findById(id).exec();
  }

  async update(id: string, updateSaleInvoiceDto: UpdateSaleInvoiceDto) {
    const saleInvoiceModel = this.getModel();
    return saleInvoiceModel
      .findByIdAndUpdate(id, updateSaleInvoiceDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    const saleInvoiceModel = this.getModel();
    return saleInvoiceModel.findByIdAndDelete(id).exec();
  }
}
