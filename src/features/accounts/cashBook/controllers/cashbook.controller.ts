import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { CashbookService } from '../services/cashbook.service';
import type { EntryType } from '../entities/cashbook.entity';
import { CreateCashbookDto } from '../dtos/CreateCashbook.dto';

function parseMMDDYYYY(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  // Accepts m/d/yyyy, mm/dd/yyyy, m/dd/yyyy, mm/d/yyyy
  const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateStr))
    throw new BadRequestException('Date must be in mm/dd/yyyy format');
  const [month, day, year] = dateStr.split('/');
  // Pad month and day to two digits
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return new Date(`${year}-${paddedMonth}-${paddedDay}`);
}

@Controller('cashbook')
export class CashbookController {
  constructor(private readonly cashbookService: CashbookService) {}

  @Post()
  async create(@Body() dto: CreateCashbookDto) {
    return await this.cashbookService.create(dto);
  }

  @Get('all')
  async getAllCashBookEntries() {
    return await this.cashbookService.getAllcashBookEntries();
  }

  @Get('total-amount/:amount')
  async getTotalAmount(@Param('amount') amount: number) {
    return await this.cashbookService.getTotalAmount(amount);
  }

  @Get()
  async getTotalCashBookAmount(
    @Query('entryType') entryType?: EntryType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (entryType) filters.entryType = entryType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    // Dates will be parsed in service, so just pass as string
    return await this.cashbookService.findAll(
      Object.keys(filters).length ? filters : undefined,
    );
  }
}
