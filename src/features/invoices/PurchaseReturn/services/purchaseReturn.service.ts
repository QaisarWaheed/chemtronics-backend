import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseReturn } from '../entities/purchaseReturn.entity';
import { CreatePurchaseReturnDto } from '../dto/createPurchaseReturn.dto';
import { UpdatePurchaseReturnDto } from '../dto/updatePurchaseReturn.dto';

@Injectable()
export class PurchaseReturnService {
  constructor(
    @InjectModel(PurchaseReturn.name)
    private purchaseReturnModel: Model<PurchaseReturn>,
  ) {}

  async create(createPurchaseReturnDto: CreatePurchaseReturnDto) {
    const created = new this.purchaseReturnModel(createPurchaseReturnDto);
    return created.save();
  }

  async findAll() {
    return this.purchaseReturnModel.find().exec();
  }

  async findOne(id: string) {
    return this.purchaseReturnModel.findById(id).exec();
  }

  async update(id: string, updatePurchaseReturnDto: UpdatePurchaseReturnDto) {
    return this.purchaseReturnModel
      .findByIdAndUpdate(id, updatePurchaseReturnDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.purchaseReturnModel.findByIdAndDelete(id).exec();
  }
}
