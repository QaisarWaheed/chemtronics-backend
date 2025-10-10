import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseInvoice } from '../entities/purchaseInvoice.entity';
import { CreatePurchaseInvoiceDto } from '../dto/createPurchaseInvoice.dto';
import { UpdatePurchaseInvoiceDto } from '../dto/updatePurchaseInvoice.dto';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export class PurchaseInvoiceService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(PurchaseInvoice.name, 'chemtronics')
    private purchaseInvoiceModel: Model<PurchaseInvoice>,
    @InjectModel(PurchaseInvoice.name, 'hydroworx')
    private purchaseInvoiceModel2: Model<PurchaseInvoice>,
  ) {}

  private getModel(): Model<PurchaseInvoice> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx' ? this.purchaseInvoiceModel2 : this.purchaseInvoiceModel;
  }

  async createPurchaseInvoice(
    data: CreatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoice> {
    const purchaseInvoiceModel = this.getModel();
    const newInvoice = await purchaseInvoiceModel.create(data);
    return newInvoice;
  }

  

  async getAllPurchaseInvoices(): Promise<PurchaseInvoice[]> {
    const purchaseInvoiceModel = this.getModel();
    return purchaseInvoiceModel.find().exec();
  }

  async getPurchaseInvoiceById(id: string): Promise<PurchaseInvoice | null> {
    const purchaseInvoiceModel = this.getModel();
    return purchaseInvoiceModel.findById(id).exec();
  }

  async updatePurchaseInvoice(
    id: string,
    data: Partial<UpdatePurchaseInvoiceDto>,
  ): Promise<PurchaseInvoice | null> {
    const purchaseInvoiceModel = this.getModel();
    const updatedInvoice = await purchaseInvoiceModel.findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedInvoice;

  }

  async deletePurchaseInvoice(id: string): Promise<PurchaseInvoice | null> {
    const purchaseInvoiceModel = this.getModel();
    return purchaseInvoiceModel.findByIdAndDelete(id).exec();
  }
}
