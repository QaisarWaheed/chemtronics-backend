import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
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

     
  ) {}


  private getModel(): Model<DeliveryChalan> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx' ? this.deliveryChalanModel2 : this.deliveryChalanModel;
  }

  async create(dto: CreateDeliveryChalanDto): Promise<DeliveryChalan> {
    const deliveryChalanModel = this.getModel();
    const chalan = await deliveryChalanModel.create(dto);
    return chalan;
  }

  async findAll(): Promise<DeliveryChalan[]> {
    const deliveryChalanModel = this.getModel();
    return deliveryChalanModel.find();
  }

  async searchPartyByName(partyName: string): Promise<DeliveryChalan[]> {
    const deliveryChalanModel = this.getModel();
    return deliveryChalanModel.find({ partyName: { $regex: partyName, $options: 'i' } });
  }

  async findOne(id: string): Promise<DeliveryChalan> {
    const deliveryChalanModel = this.getModel();
    let chalan;
    if (isValidObjectId(id)) {
      chalan = await deliveryChalanModel.findById(id);
    } else {
      chalan = await deliveryChalanModel.findOne({ chalanNo: id });
    }
    if (!chalan) throw new NotFoundException('Delivery Chalan not found');
    return chalan;
  }

  async update(id: string, dto: UpdateDeliveryChalanDto) {
    const deliveryChalanModel = this.getModel();
    let updatedChalan;
    if (isValidObjectId(id)) {
      updatedChalan = await deliveryChalanModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    } else {
      updatedChalan = await deliveryChalanModel.findOneAndUpdate({ chalanNo: id }, dto, { new: true }).exec();
    }
    if (!updatedChalan) throw new NotFoundException('Delivery Chalan not found');
    return updatedChalan;
  }

  async remove(id: string): Promise<void> {
    const deliveryChalanModel = this.getModel();
    let result;
    if (isValidObjectId(id)) {
      result = await deliveryChalanModel.deleteOne({ _id: id });
    } else {
      result = await deliveryChalanModel.deleteOne({ chalanNo: id });
    }
    if (!result.acknowledged || result.deletedCount === 0)
      throw new NotFoundException('Delivery Chalan not found');
  }
}
