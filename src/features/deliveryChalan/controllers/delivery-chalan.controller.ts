import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryChalanService } from '../services/delivery-chalan.service';
import {
  CreateDeliveryChalanDto,
  UpdateDeliveryChalanDto,
} from '../dto/delivery-chalan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('delivery-chalan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-chalan')
export class DeliveryChalanController {
  constructor(private readonly deliveryChalanService: DeliveryChalanService) {}

  @Post()
  create(@Body() dto: CreateDeliveryChalanDto) {
    return this.deliveryChalanService.create(dto);
  }

  @Post('convert/:invoiceId')
  convertFromInvoice(@Param('invoiceId') invoiceId: string) {
    return this.deliveryChalanService.createFromInvoice(invoiceId);
  }

  @Get()
  findAll() {
    return this.deliveryChalanService.findAll();
  }

  @Get('search')
  search(@Query('term') term?: string, @Query('status') status?: string) {
    return this.deliveryChalanService.search(term, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryChalanService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryChalanDto) {
    return this.deliveryChalanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryChalanService.remove(id);
  }
}
