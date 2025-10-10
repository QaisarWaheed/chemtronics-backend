import { Inject, Injectable, Scope } from '@nestjs/common';
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
    const created = new saleInvoiceModel(createSaleInvoiceDto);
    return created.save();
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
