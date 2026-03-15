import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryChalan } from '../entities/delivery-chalan.entity';
import {
  CreateDeliveryChalanDto,
  UpdateDeliveryChalanDto,
} from '../dto/delivery-chalan.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class DeliveryChalanService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(DeliveryChalan.name, 'chemtronics')
    private deliveryChalanModel: Model<DeliveryChalan>,
    @InjectModel(DeliveryChalan.name, 'hydroworx')
    private deliveryChalanModel2: Model<DeliveryChalan>,
    @InjectModel('SaleInvoice', 'chemtronics')
    private saleInvoiceModelChem: Model<any>,
    @InjectModel('SaleInvoice', 'hydroworx')
    private saleInvoiceModelHydro: Model<any>,
  ) {}

  private getModel(): Model<DeliveryChalan> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx'
      ? this.deliveryChalanModel2
      : this.deliveryChalanModel;
  }

  private getSaleInvoiceModel(): Model<any> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx'
      ? this.saleInvoiceModelHydro
      : this.saleInvoiceModelChem;
  }

  async createFromInvoice(invoiceId: string): Promise<DeliveryChalan> {
    const saleInvoiceModel = this.getSaleInvoiceModel();
    const deliveryChalanModel = this.getModel();

    const invoice = (await saleInvoiceModel
      .findById(invoiceId)
      .lean()
      .exec()) as any;
    if (!invoice) {
      throw new NotFoundException(`Sale invoice not found: ${invoiceId}`);
    }

    if (invoice.isChallanGenerated) {
      throw new BadRequestException(
        'A delivery challan has already been generated for this invoice.',
      );
    }

    // Auto-generate next challan number from latest document within this brand
    const latestChallan = (await deliveryChalanModel
      .findOne({}, { id: 1, chalanNo: 1 })
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as any;

    let nextNum = 1001;
    if (latestChallan) {
      const ref = latestChallan.id ?? latestChallan.chalanNo ?? '';
      const m = String(ref).match(/(\d+)$/);
      if (m) nextNum = parseInt(m[1], 10) + 1;
    }
    const challanId = `DC-${nextNum}`;

    const today = new Date().toISOString().split('T')[0];

    // Map invoice products → challan items (handles both productName/product and quantity/qty)
    const rawProducts = Array.isArray(invoice.products)
      ? invoice.products
      : Array.isArray(invoice.items)
        ? invoice.items
        : [];
    const items = (rawProducts as any[]).map((p: any, idx: number) => ({
      sr: idx + 1,
      itemCode: String(p.code ?? ''),
      particulars: String(p.productName ?? p.product ?? ''),
      unit: 'Nos',
      length: '',
      width: '',
      qty: String(p.quantity ?? p.qty ?? 0),
      amount: Number(p.netAmount ?? p.exGSTAmount ?? p.amount ?? 0),
    }));

    const challan = await deliveryChalanModel.create({
      id: challanId,
      chalanNo: challanId,
      poNo: invoice.poNumber ?? '',
      poDate: invoice.poDate
        ? new Date(invoice.poDate).toISOString().split('T')[0]
        : today,
      partyName: invoice.accountTitle ?? '',
      partyAddress: '',
      date: today,
      deliveryDate: today,
      status: 'Pending',
      items,
      invoiceReference: invoice.invoiceNumber,
    });

    // Mark the invoice so duplicates are prevented
    await saleInvoiceModel.findByIdAndUpdate(invoiceId, {
      isChallanGenerated: true,
    });

    return challan;
  }

  async create(dto: CreateDeliveryChalanDto): Promise<DeliveryChalan> {
    const deliveryChalanModel = this.getModel();
    // Ensure chalanNo mirrors id to satisfy the legacy MongoDB unique index
    const chalan = await deliveryChalanModel.create({
      ...dto,
      chalanNo: dto.id,
    });
    return chalan;
  }

  async findAll(): Promise<DeliveryChalan[]> {
    const deliveryChalanModel = this.getModel();
    return deliveryChalanModel.find();
  }

  async search(term?: string, status?: string): Promise<DeliveryChalan[]> {
    const deliveryChalanModel = this.getModel();
    const query: any = {};

    // Multi-field search: id, partyName, poNo
    if (term && term.trim()) {
      query.$or = [
        { id: { $regex: term, $options: 'i' } },
        { partyName: { $regex: term, $options: 'i' } },
        { poNo: { $regex: term, $options: 'i' } },
      ];
    }

    // Optional status filter
    if (status && status.trim()) {
      query.status = status;
    }

    return deliveryChalanModel.find(query);
  }

  async searchPartyByName(partyName: string): Promise<DeliveryChalan[]> {
    const deliveryChalanModel = this.getModel();
    return deliveryChalanModel.find({
      partyName: { $regex: partyName, $options: 'i' },
    });
  }

  async findOne(id: string): Promise<DeliveryChalan> {
    const deliveryChalanModel = this.getModel();
    let chalan;
    if (isValidObjectId(id)) {
      chalan = await deliveryChalanModel.findById(id);
    } else {
      chalan = await deliveryChalanModel.findOne({ id: id });
    }
    if (!chalan) throw new NotFoundException('Delivery Chalan not found');
    return chalan;
  }

  async update(id: string, dto: UpdateDeliveryChalanDto) {
    const deliveryChalanModel = this.getModel();
    let updatedChalan;
    if (isValidObjectId(id)) {
      updatedChalan = await deliveryChalanModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();
    } else {
      updatedChalan = await deliveryChalanModel
        .findOneAndUpdate({ id: id }, dto, { new: true })
        .exec();
    }
    if (!updatedChalan)
      throw new NotFoundException('Delivery Chalan not found');
    return updatedChalan;
  }

  async remove(id: string): Promise<void> {
    const deliveryChalanModel = this.getModel();
    let result;
    if (isValidObjectId(id)) {
      result = await deliveryChalanModel.deleteOne({ _id: id });
    } else {
      result = await deliveryChalanModel.deleteOne({ id: id });
    }
    if (!result.acknowledged || result.deletedCount === 0)
      throw new NotFoundException('Delivery Chalan not found');
  }
}
