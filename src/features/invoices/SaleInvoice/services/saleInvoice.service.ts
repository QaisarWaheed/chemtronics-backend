import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaleInvoice } from '../entities/saleInvoice.entity';
import { CreateSaleInvoiceDto } from '../dto/createSaleInvoice.dto';
import { UpdateSaleInvoiceDto } from '../dto/updateSaleInvoice.dto';

@Injectable()
export class SaleInvoiceService {
  constructor(
    @InjectModel(SaleInvoice.name) private saleInvoiceModel: Model<SaleInvoice>,
  ) {}

  async create(createSaleInvoiceDto: CreateSaleInvoiceDto) {
    const created = new this.saleInvoiceModel(createSaleInvoiceDto);
    return created.save();
  }

  async findAll() {
    return this.saleInvoiceModel.find().exec();
  }

  async findOne(id: string) {
    return this.saleInvoiceModel.findById(id).exec();
  }

  async update(id: string, updateSaleInvoiceDto: UpdateSaleInvoiceDto) {
    return this.saleInvoiceModel
      .findByIdAndUpdate(id, updateSaleInvoiceDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.saleInvoiceModel.findByIdAndDelete(id).exec();
  }
}
