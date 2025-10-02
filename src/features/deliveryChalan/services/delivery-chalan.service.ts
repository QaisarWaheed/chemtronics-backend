import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryChalan } from '../entities/delivery-chalan.entity';
import {
  CreateDeliveryChalanDto,
  UpdateDeliveryChalanDto,
} from '../dto/delivery-chalan.dto';

@Injectable()
export class DeliveryChalanService {
  constructor(
    @InjectRepository(DeliveryChalan)
    private readonly deliveryChalanRepository: Repository<DeliveryChalan>,
  ) {}

  async create(dto: CreateDeliveryChalanDto): Promise<DeliveryChalan> {
    const chalan = this.deliveryChalanRepository.create(dto);
    return this.deliveryChalanRepository.save(chalan);
  }

  async findAll(): Promise<DeliveryChalan[]> {
    return this.deliveryChalanRepository.find();
  }

  async findOne(id: number): Promise<DeliveryChalan> {
    const chalan = await this.deliveryChalanRepository.findOneBy({ id });
    if (!chalan) throw new NotFoundException('Delivery Chalan not found');
    return chalan;
  }

  async update(
    id: number,
    dto: UpdateDeliveryChalanDto,
  ): Promise<DeliveryChalan> {
    const chalan = await this.findOne(id);
    Object.assign(chalan, dto);
    return this.deliveryChalanRepository.save(chalan);
  }

  async remove(id: number): Promise<void> {
    const result = await this.deliveryChalanRepository.delete(id);
    if (!result.affected)
      throw new NotFoundException('Delivery Chalan not found');
  }
}
