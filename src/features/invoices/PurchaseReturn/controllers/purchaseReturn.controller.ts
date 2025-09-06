import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PurchaseReturnService } from '../services/purchaseReturn.service';
import { CreatePurchaseReturnDto } from '../dto/createPurchaseReturn.dto';
import { UpdatePurchaseReturnDto } from '../dto/updatePurchaseReturn.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Purchase Return')
@Controller('purchase-return')
export class PurchaseReturnController {
  constructor(private readonly purchaseReturnService: PurchaseReturnService) {}

  @Post()
  create(@Body() createPurchaseReturnDto: CreatePurchaseReturnDto) {
    return this.purchaseReturnService.create(createPurchaseReturnDto);
  }

  @Get()
  findAll() {
    return this.purchaseReturnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseReturnService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseReturnDto: UpdatePurchaseReturnDto,
  ) {
    return this.purchaseReturnService.update(id, updatePurchaseReturnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseReturnService.remove(id);
  }
}
