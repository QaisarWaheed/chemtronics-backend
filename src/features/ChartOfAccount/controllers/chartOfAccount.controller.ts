/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ChartOfAccountService } from '../services/chartOfAccount.service';
import { CreateChartOfAccountDto } from '../dto/createChartOfAccount.dto';
import { UpdateChartOfAccountDto } from '../dto/updateChartOfAccount.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateOpeningBalanceDto } from '../dto/updateOpeningBalance.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Chart Of Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chart-of-account')
export class ChartOfAccountController {
  @Get('find-accountby-accountType/:accountType')
  findByAccountType(@Param('accountType') accountType: string) {
    return this.chartOfAccountService.findByAccountType(accountType);
  }
  @Get('sales-accounts')
  getSalesAccounts() {
    return this.chartOfAccountService.findSalesAccounts();
  }
  constructor(private readonly chartOfAccountService: ChartOfAccountService) {}

  @Post()
  create(@Body() createChartOfAccountDto: CreateChartOfAccountDto) {
    return this.chartOfAccountService.create(createChartOfAccountDto);
  }

  @Get()
  findAll() {
    return this.chartOfAccountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (id === 'all') {
      return this.chartOfAccountService.findAll();
    }
    return this.chartOfAccountService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateChartOfAccountDto: UpdateChartOfAccountDto,
  ) {
    return this.chartOfAccountService.update(id, updateChartOfAccountDto);
  }

  @Put('/openingBalance/:id')
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateOpeningBalanceDto: UpdateOpeningBalanceDto,
  ) {
    const debit = Number(updateOpeningBalanceDto?.debit ?? 0);
    const credit = Number(updateOpeningBalanceDto?.credit ?? 0);
    await this.chartOfAccountService.updateOpeningBalance(
      id,
      Number.isFinite(debit) ? debit : 0,
      Number.isFinite(credit) ? credit : 0,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Validate ObjectId format
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(id);
    if (!isValidObjectId) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    const deleted = await this.chartOfAccountService.remove(id);
    if (!deleted) {
      throw new NotFoundException('ChartOfAccount entry not found');
    }
    return deleted;
  }
}
