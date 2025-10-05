import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ChartOfAccountService } from '../services/chartOfAccount.service';
import { CreateChartOfAccountDto } from '../dto/createChartOfAccount.dto';
import { UpdateChartOfAccountDto } from '../dto/updateChartOfAccount.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chart Of Account')
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chartOfAccountService.remove(id);
  }
}
