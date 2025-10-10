import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseReturn } from '../entities/purchaseReturn.entity';
import { CreatePurchaseReturnDto } from '../dto/createPurchaseReturn.dto';
import { UpdatePurchaseReturnDto } from '../dto/updatePurchaseReturn.dto';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class PurchaseReturnService {
  constructor(
    @Inject(REQUEST) private readonly req: any,

    @InjectModel(PurchaseReturn.name, 'test')
    private purchaseReturnModel: Model<PurchaseReturn>,
    @InjectModel(PurchaseReturn.name, 'hydroworx')
    private purchaseReturnModel2: Model<PurchaseReturn>,
  ) {}


    private getModel(): Model<PurchaseReturn> {
      const brand = this.req['brand'] || 'test';
      return brand === 'hydroworx' ? this.purchaseReturnModel2 : this.purchaseReturnModel;
    }

  async create(createPurchaseReturnDto: CreatePurchaseReturnDto) {
    const purchaseReturnModel = this.getModel();
    const created = new purchaseReturnModel(createPurchaseReturnDto);
    return created.save();
  }

  async findAll() {
    const purchaseReturnModel = this.getModel();
    return purchaseReturnModel.find().exec();
  }

  async findOne(id: string) {
    const purchaseReturnModel = this.getModel();
    return purchaseReturnModel.findById(id).exec();
  }

  async update(id: string, updatePurchaseReturnDto: UpdatePurchaseReturnDto) {
    const purchaseReturnModel = this.getModel();
    return purchaseReturnModel
      .findByIdAndUpdate(id, updatePurchaseReturnDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    const purchaseReturnModel = this.getModel();
    return purchaseReturnModel.findByIdAndDelete(id).exec();
  }
}
