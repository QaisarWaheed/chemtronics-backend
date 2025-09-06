import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseInvoice } from '../entities/purchaseInvoice.entity';
import { CreatePurchaseInvoiceDto } from '../dto/createPurchaseInvoice.dto';
import { UpdatePurchaseInvoiceDto } from '../dto/updatePurchaseInvoice.dto';

export class PurchaseInvoiceService {
  constructor(
    @InjectModel(PurchaseInvoice.name)
    private purchaseInvoiceModel: Model<PurchaseInvoice>,
  ) {}

  async createPurchaseInvoice(
    data: CreatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoice> {
    const newInvoice = await this.purchaseInvoiceModel.create(data);
    return newInvoice;
  }

  async getAllPurchaseInvoices(): Promise<PurchaseInvoice[]> {
    return this.purchaseInvoiceModel.find().exec();
  }

  async getPurchaseInvoiceById(id: string): Promise<PurchaseInvoice | null> {
    return this.purchaseInvoiceModel.findById(id).exec();
  }

  async updatePurchaseInvoice(
    id: string,
    data: Partial<UpdatePurchaseInvoiceDto>,
  ): Promise<PurchaseInvoice | null> {
    return this.purchaseInvoiceModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async deletePurchaseInvoice(id: string): Promise<PurchaseInvoice | null> {
    return this.purchaseInvoiceModel.findByIdAndDelete(id).exec();
  }
}
