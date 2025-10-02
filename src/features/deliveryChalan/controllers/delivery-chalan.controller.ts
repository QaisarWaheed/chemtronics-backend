import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryChalanService } from '../services/delivery-chalan.service';
import {
  CreateDeliveryChalanDto,
  UpdateDeliveryChalanDto,
} from '../dto/delivery-chalan.dto';

@ApiTags('delivery-chalan')
@Controller('delivery-chalan')
export class DeliveryChalanController {
  constructor(private readonly deliveryChalanService: DeliveryChalanService) {}

  @Post()
  create(@Body() dto: CreateDeliveryChalanDto) {
    return this.deliveryChalanService.create(dto);
  }

  @Get()
  findAll() {
    return this.deliveryChalanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryChalanService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryChalanDto) {
    return this.deliveryChalanService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryChalanService.remove(Number(id));
  }
}
