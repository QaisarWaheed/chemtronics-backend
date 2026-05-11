import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ReportsService } from '../reports.service';
import { PdfService } from '../../invoices/SaleInvoice/services/pdf.service';
import type { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth()
@Roles('Super Admin', 'Company Admin', 'Accounts User')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('dashboard-stats')
  @Roles('Super Admin', 'Company Admin', 'Accounts User', 'Staff')
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('trial-balance')
  async getTrialBalance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getTrialBalance(startDate, endDate);
  }

  @Get('accounts-receivable')
  async getAccountsReceivable() {
    return this.reportsService.getAccountsReceivable();
  }

  @Get('pending-receivable-invoices')
  async getPendingReceivableInvoices(
    @Query('accountNumber') accountNumber?: string,
  ) {
    if (!accountNumber?.trim()) {
      throw new BadRequestException('accountNumber query parameter is required');
    }
    return this.reportsService.getPendingReceivableInvoices(
      accountNumber.trim(),
    );
  }

  @Get('accounts-payable')
  async getAccountsPayable() {
    return this.reportsService.getAccountsPayable();
  }

  @Get('general-ledger/:accountNumber/pdf')
  async getGeneralLedgerPdf(
    @Param('accountNumber') accountNumber: string,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('includeOpeningBalance') includeOpeningBalance?: string,
    @Query('openingScope') openingScope?: string,
  ) {
    const includeOb = includeOpeningBalance === 'true';
    const [transactions, accountInfo] = await Promise.all([
      this.reportsService.getGeneralLedger(
        accountNumber,
        startDate,
        endDate,
        includeOb,
        openingScope,
      ),
      this.reportsService.getAccountInfo(accountNumber),
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="ledger-${accountNumber}.pdf"`,
    );

    const doc = this.pdfService.generateLedgerPdf(
      transactions as any[],
      accountInfo,
      { startDate, endDate },
    );
    doc.pipe(res as any);
  }

  @Get('general-ledger/:accountNumber')
  async getGeneralLedger(
    @Param('accountNumber') accountNumber: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('includeOpeningBalance') includeOpeningBalance?: string,
    @Query('openingScope') openingScope?: string,
  ) {
    const includeOb = includeOpeningBalance === 'true';
    return this.reportsService.getGeneralLedger(
      accountNumber,
      startDate,
      endDate,
      includeOb,
      openingScope,
    );
  }

  @Get('profit-loss')
  async getProfitAndLoss(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate query parameters are required (ISO 8601)',
      );
    }
    return this.reportsService.getProfitAndLoss(startDate, endDate);
  }

  @Get('balance-sheet')
  async getBalanceSheet(@Query('asOfDate') asOfDate?: string) {
    if (!asOfDate) {
      throw new BadRequestException(
        'asOfDate query parameter is required (ISO 8601, e.g. 2026-03-31)',
      );
    }
    return this.reportsService.getBalanceSheet(asOfDate);
  }
}
