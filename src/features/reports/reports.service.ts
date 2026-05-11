import { Injectable, Inject, Scope } from '@nestjs/common';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { JournalVoucher } from '../accounts/journalVoucher/entities/journal-voucher/journal-voucher';

export interface TopProduct {
  code: number;
  productName: string;
  totalRevenue: number;
  totalQtySold: number;
}

export interface LowStockProduct {
  code: number;
  productName: string;
  quantity: number;
  minimumStockLevel: number;
}

export interface MonthlySales {
  month: string;
  total: number;
}

export interface DashboardStats {
  currentMonthSales: number;
  lastMonthSales: number;
  totalReceivables: number;
  totalPayables: number;
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  monthlySalesTrend: MonthlySales[];
}

export interface PLAccountLine {
  accountNumber: string;
  accountName: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  /** Revenue: credit − debit  |  Expense: debit − credit */
  netAmount: number;
}

export interface ProfitAndLoss {
  period: { startDate: string; endDate: string };
  revenue: { lines: PLAccountLine[]; total: number };
  expenses: { lines: PLAccountLine[]; total: number };
  /** Positive = profit, Negative = loss */
  netProfit: number;
}

export interface BSAccountLine {
  accountNumber: string;
  accountName: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  /** Always positive: Asset = dr−cr | Liability/Equity = cr−dr */
  netAmount: number;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: { lines: BSAccountLine[]; total: number };
  liabilities: { lines: BSAccountLine[]; total: number };
  equity: {
    lines: BSAccountLine[];
    /** Sum of explicit Equity CoA accounts */
    explicitTotal: number;
    /** Cumulative net profit from all time up to asOfDate */
    retainedEarnings: number;
    /** explicitTotal + retainedEarnings */
    total: number;
  };
  totalLiabilitiesAndEquity: number;
  /** true when Assets ≈ Liabilities + Equity (< 0.01 rounding tolerance) */
  isBalanced: boolean;
}

export interface GLEntry {
  date: Date;
  voucherNumber: string;
  accountNumber: string;
  accountName?: string;
  accountType?: string;
  description?: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface TrialBalanceRow {
  accountNumber: string;
  accountName?: string;
  accountType?: string;
  parentAccount?: string;
  totalDebit: number;
  totalCredit: number;
  /** Positive = net Debit, Negative = net Credit */
  netBalance: number;
}

export interface ARCustomer {
  accountNumber: string;
  accountName: string;
  /** Opening balances from Chart of Accounts (party 14xx). */
  openingDebit: number;
  openingCredit: number;
  /** Gross debits / credits on journal lines aged ≤30 days (same window as former “Current”). */
  currentDebit: number;
  currentCredit: number;
  /** Net receivable: total journal debit − total journal credit for this account. */
  closingBalance: number;
}

export interface APVendor {
  accountNumber: string;
  accountName: string;
  /** Total outstanding: totalCredit − totalDebit (credit-normal) */
  outstanding: number;
  current: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
}

/** Open sale invoices for a receivable (14xx) party account — for journal voucher allocation. */
export interface PendingReceivableInvoiceRow {
  invoiceNumber: string;
  invoiceDate: string;
  accountTitle: string;
  totalAmount: number;
}

@Injectable({ scope: Scope.REQUEST })
export class ReportsService {
  constructor(
    @Inject(REQUEST) private readonly req: Record<string, unknown>,
    @InjectModel(JournalVoucher.name, 'chemtronics')
    private readonly jvModelChemtronics: Model<JournalVoucher>,
    @InjectModel(JournalVoucher.name, 'hydroworx')
    private readonly jvModelHydroworx: Model<JournalVoucher>,
    @InjectModel('SaleInvoice', 'chemtronics')
    private readonly saleModelChemtronics: Model<any>,
    @InjectModel('SaleInvoice', 'hydroworx')
    private readonly saleModelHydroworx: Model<any>,
    @InjectModel('Products', 'chemtronics')
    private readonly productModelChemtronics: Model<any>,
    @InjectModel('Products', 'hydroworx')
    private readonly productModelHydroworx: Model<any>,
    @InjectModel('ChartOfAccount', 'chemtronics')
    private readonly chartModelChemtronics: Model<any>,
    @InjectModel('ChartOfAccount', 'hydroworx')
    private readonly chartModelHydroworx: Model<any>,
  ) {}

  private getBrand(): string {
    const brand = ((this.req['brand'] as string) || 'chemtronics')
      .toLowerCase()
      .trim();
    console.log('Incoming Header x-brand:', brand);
    return brand;
  }

  private getChartModel(brand: string): Model<any> {
    return brand === 'hydroworx'
      ? this.chartModelHydroworx
      : this.chartModelChemtronics;
  }

  /** Net opening from chart-of-accounts master (debit − credit). */
  private chartAccountOpeningNet(
    coaDoc: Record<string, unknown> | null | undefined,
  ): number {
    if (!coaDoc) return 0;
    const d =
      Number(
        (coaDoc as any).debit ?? (coaDoc as any).openingBalance?.debit ?? 0,
      ) || 0;
    const c =
      Number(
        (coaDoc as any).credit ?? (coaDoc as any).openingBalance?.credit ?? 0,
      ) || 0;
    return d - c;
  }

  async getAccountInfo(
    accountNumber: string,
  ): Promise<{ accountNumber: string; accountName: string }> {
    const code = accountNumber.split('-')[0].trim();
    if (!code || code.toLowerCase() === 'all') {
      return { accountNumber: 'ALL', accountName: 'All Accounts' };
    }
    const brand = this.getBrand();
    const account = await this.getChartModel(brand)
      .findOne({
        $or: [{ accountCode: code }, { selectedCode: code }],
      })
      .lean()
      .exec();
    return {
      accountNumber: code,
      accountName: (account as any)?.accountName || code,
    };
  }

  private getModel(brand: string): Model<JournalVoucher> {
    const model =
      brand === 'hydroworx' ? this.jvModelHydroworx : this.jvModelChemtronics;
    console.log('ACTIVE DB:', model.db.name, '| Brand:', brand);
    return model;
  }

  private getSaleModel(brand: string): Model<any> {
    return brand === 'hydroworx'
      ? this.saleModelHydroworx
      : this.saleModelChemtronics;
  }

  private getProductModel(brand: string): Model<any> {
    return brand === 'hydroworx'
      ? this.productModelHydroworx
      : this.productModelChemtronics;
  }

  async getBalanceSheet(asOfDate: string): Promise<BalanceSheet> {
    const brand = this.getBrand();
    const end = new Date(asOfDate);
    end.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $lookup: {
          from: 'chartofaccounts',
          localField: '_id',
          foreignField: 'selectedCode',
          as: 'account',
        },
      },
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: false } },
    ];

    const [bsRows, reRows] = await Promise.all([
      // 1) Asset / Liability / Equity account balances
      this.getModel(brand).aggregate<BSAccountLine & { parentAccount: string }>(
        [
          { $match: { date: { $lte: end } } },
          {
            $group: {
              _id: '$accountNumber',
              totalDebit: { $sum: { $ifNull: ['$debit', 0] } },
              totalCredit: { $sum: { $ifNull: ['$credit', 0] } },
            },
          },
          ...pipeline,
          {
            $match: {
              'account.parentAccount': {
                $in: ['Asset', 'Liability', 'Equity'],
              },
            },
          },
          {
            $project: {
              _id: 0,
              accountNumber: '$_id',
              accountName: '$account.accountName',
              accountType: '$account.accountType',
              parentAccount: '$account.parentAccount',
              totalDebit: 1,
              totalCredit: 1,
              // Asset accounts are debit-normal; Liability/Equity are credit-normal
              netAmount: {
                $cond: {
                  if: { $eq: ['$account.parentAccount', 'Asset'] },
                  then: { $subtract: ['$totalDebit', '$totalCredit'] },
                  else: { $subtract: ['$totalCredit', '$totalDebit'] },
                },
              },
            },
          },
          { $sort: { parentAccount: 1, accountNumber: 1 } },
        ],
      ),

      // 2) Retained Earnings: sum(credit − debit) across all Revenue + Expense
      //    accounts from inception to asOfDate.
      //    Revenue rows: credit > debit → positive contribution
      //    Expense rows: debit > credit → negative contribution
      this.getModel(brand).aggregate<{ retainedEarnings: number }>([
        { $match: { date: { $lte: end } } },
        {
          $group: {
            _id: '$accountNumber',
            totalDebit: { $sum: { $ifNull: ['$debit', 0] } },
            totalCredit: { $sum: { $ifNull: ['$credit', 0] } },
          },
        },
        ...pipeline,
        {
          $match: {
            'account.parentAccount': { $in: ['Revenue', 'Expense'] },
          },
        },
        {
          $group: {
            _id: null,
            retainedEarnings: {
              $sum: { $subtract: ['$totalCredit', '$totalDebit'] },
            },
          },
        },
        { $project: { _id: 0, retainedEarnings: 1 } },
      ]),
    ]);

    const assetLines = bsRows.filter((r) => r.parentAccount === 'Asset');
    const liabilityLines = bsRows.filter(
      (r) => r.parentAccount === 'Liability',
    );
    const equityLines = bsRows.filter((r) => r.parentAccount === 'Equity');

    const totalAssets = assetLines.reduce((s, r) => s + r.netAmount, 0);
    const totalLiabilities = liabilityLines.reduce(
      (s, r) => s + r.netAmount,
      0,
    );
    const explicitTotal = equityLines.reduce((s, r) => s + r.netAmount, 0);
    const retainedEarnings = reRows[0]?.retainedEarnings ?? 0;
    const totalEquity = explicitTotal + retainedEarnings;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return {
      asOfDate,
      assets: { lines: assetLines, total: totalAssets },
      liabilities: { lines: liabilityLines, total: totalLiabilities },
      equity: {
        lines: equityLines,
        explicitTotal,
        retainedEarnings,
        total: totalEquity,
      },
      totalLiabilitiesAndEquity,
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
    };
  }

  async getGeneralLedger(
    accountNumber: string,
    startDate?: string,
    endDate?: string,
    includeOpeningBalance = false,
    openingScope?: string,
  ): Promise<GLEntry[]> {
    // Sanitize: strip combined labels (e.g. '14101-Cash' → '14101')
    const code = accountNumber.split('-')[0].trim();
    const isGlobal = !code || code.toLowerCase() === 'all';
    const brand = this.getBrand();
    const scopeCodes =
      isGlobal && openingScope?.trim()
        ? openingScope
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    console.log('GL Search Query:', {
      accountNumber: isGlobal ? 'ALL' : code,
      brand,
      includeOpeningBalance,
      openingScope: scopeCodes.length ? scopeCodes.join(',') : undefined,
    });

    const dateFilter: Record<string, Date> = {};
    let periodStart: Date | null = null;
    if (startDate) {
      const d = new Date(startDate);
      d.setHours(0, 0, 0, 0);
      periodStart = d;
      dateFilter['$gte'] = d;
    }
    if (endDate) {
      const d = new Date(endDate);
      d.setHours(23, 59, 59, 999);
      dateFilter['$lte'] = d;
    }

    // Global: no account filter — return everything for the brand
    // Specific: prefix regex handles codes stored as '14101' or '14101 - Name'
    const match: Record<string, unknown> = isGlobal
      ? {}
      : { accountNumber: { $regex: '^' + code, $options: 'i' } };
    if (Object.keys(dateFilter).length) {
      match['date'] = dateFilter;
    }

    const chartCollection = this.getChartModel(brand).collection.name;

    const rows = await this.getModel(brand).aggregate<{
      date: Date;
      voucherNumber: string;
      accountNumber: string;
      accountName?: string;
      accountType?: string;
      description?: string;
      debit: number;
      credit: number;
    }>([
      { $match: match },
      // JV accountNumber may be "14126" or "14126 - Name …" — join CoA on numeric code prefix
      {
        $addFields: {
          coaLookupCode: {
            $trim: {
              input: {
                $arrayElemAt: [
                  {
                    $split: [
                      { $trim: { input: { $toString: '$accountNumber' } } },
                      '-',
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: chartCollection,
          localField: 'coaLookupCode',
          foreignField: 'accountCode',
          as: 'coaDoc',
        },
      },
      { $unwind: { path: '$coaDoc', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          accountName: '$coaDoc.accountName',
          accountType: '$coaDoc.accountType',
        },
      },
      // Chronological order so running balance matches account ledger convention
      { $sort: { date: 1, _id: 1 } },
      {
        $project: {
          _id: 0,
          date: 1,
          voucherNumber: 1,
          accountNumber: 1,
          description: 1,
          debit: { $ifNull: ['$debit', 0] },
          credit: { $ifNull: ['$credit', 0] },
          accountName: 1,
          accountType: 1,
        },
      },
    ]);

    console.log(
      'GL: rows found =',
      rows.length,
      '| first accountName:',
      rows[0]?.accountName,
      '| first accountType:',
      rows[0]?.accountType,
    );

    // Enrich descriptions with invoice line item details
    const enrichedRows = await Promise.all(
      rows.map(async (row) => {
        let enrichedDescription = row.description || '';

        // Try to find matching sale invoice for product details
        const invoiceNum = row.voucherNumber;
        if (invoiceNum && invoiceNum.startsWith('INV-')) {
          try {
            const saleInvoice = await this.getSaleModel(brand)
              .findOne({ invoiceNumber: invoiceNum })
              .lean()
              .exec();

            if (saleInvoice && (saleInvoice as any).products && (saleInvoice as any).products.length > 0) {
              const productDetails = (saleInvoice as any).products
                .map((p: any) => {
                  const qty = p.quantity || 0;
                  const rate = p.rate || 0;
                  const amount = p.netAmount || 0;
                  return `${p.productName || 'Product'} - Qty: ${qty}, Rate: Rs.${rate.toFixed(2)}, Amount: Rs.${amount.toFixed(2)}`;
                })
                .join('\n');
              enrichedDescription = productDetails;
            }
          } catch (e) {
            console.log('Could not enrich invoice details for:', invoiceNum);
          }
        }

        return {
          ...row,
          description: enrichedDescription,
        };
      }),
    );

    let rowsWithOpening = enrichedRows as typeof enrichedRows;
    if (includeOpeningBalance) {
      let openingAnchor: Date | null = periodStart;
      if (!openingAnchor && enrichedRows.length > 0) {
        const fd = new Date(enrichedRows[0].date as Date);
        fd.setHours(0, 0, 0, 0);
        openingAnchor = fd;
      }

      if (openingAnchor) {
        const priorMatch: Record<string, unknown> = {
          date: { $lt: openingAnchor },
        };
        if (!isGlobal) {
          priorMatch['accountNumber'] = {
            $regex: '^' + escapeRegex(code),
            $options: 'i',
          };
        } else if (scopeCodes.length > 0) {
          priorMatch['$or'] = scopeCodes.map((c) => ({
            accountNumber: {
              $regex: '^' + escapeRegex(c),
              $options: 'i',
            },
          }));
        }
        const priorAgg = await this.getModel(brand).aggregate<{
          debit: number;
          credit: number;
        }>([
          { $match: priorMatch },
          {
            $group: {
              _id: null,
              debit: { $sum: { $ifNull: ['$debit', 0] } },
              credit: { $sum: { $ifNull: ['$credit', 0] } },
            },
          },
        ]);
        const journalOpeningNet =
          (priorAgg[0]?.debit ?? 0) - (priorAgg[0]?.credit ?? 0);

        let chartOpeningNet = 0;
        let openingName = 'All accounts';
        let openingType: string | undefined;
        let openingAccountNumber = 'ALL';

        if (!isGlobal) {
          const coa = await this.getChartModel(brand)
            .findOne({
              $or: [{ accountCode: code }, { selectedCode: code }],
            })
            .lean()
            .exec();
          chartOpeningNet = this.chartAccountOpeningNet(coa as any);
          openingName = (coa as any)?.accountName || code;
          openingType = (coa as any)?.accountType;
          openingAccountNumber = code;
        } else if (scopeCodes.length > 0) {
          const names: string[] = [];
          for (const c of scopeCodes) {
            const coa = await this.getChartModel(brand)
              .findOne({
                $or: [{ accountCode: c }, { selectedCode: c }],
              })
              .lean()
              .exec();
            chartOpeningNet += this.chartAccountOpeningNet(coa as any);
            const nm = (coa as any)?.accountName?.trim();
            if (nm) names.push(nm);
          }
          openingAccountNumber = scopeCodes.join(',');
          openingName =
            names.length === 1
              ? names[0]!
              : names.length > 1
                ? `${names.length} accounts (${scopeCodes.join(', ')})`
                : scopeCodes.join(', ');
          openingType = undefined;
        } else {
          // Include party / receivable lines and any row with stored opening amounts.
          // (Summing only `type: 'Detail'` missed many real accounts and showed 0 B/F.)
          const coaRows = await this.getChartModel(brand)
            .find({
              $or: [
                { debit: { $gt: 0 } },
                { credit: { $gt: 0 } },
                { 'openingBalance.debit': { $gt: 0 } },
                { 'openingBalance.credit': { $gt: 0 } },
                { type: { $in: ['Detail', 'detail'] } },
                { isParty: true },
              ],
            })
            .lean()
            .exec();
          for (const doc of coaRows as any[]) {
            chartOpeningNet += this.chartAccountOpeningNet(doc);
          }
        }

        const openingNet = journalOpeningNet + chartOpeningNet;

        const drOb = openingNet > 0 ? openingNet : 0;
        const crOb = openingNet < 0 ? -openingNet : 0;
        const usedExplicitFrom = !!periodStart;
        const scopedGlobal = isGlobal && scopeCodes.length > 0;
        const openingRow = {
          date: new Date(openingAnchor),
          voucherNumber: '—',
          accountNumber: openingAccountNumber,
          accountName: openingName,
          accountType: openingType,
          description: !isGlobal
            ? usedExplicitFrom
              ? 'Opening balance (brought forward)'
              : 'Opening balance — before first listed day (brought forward)'
            : scopedGlobal
              ? usedExplicitFrom
                ? `Opening balance — ${openingName} — before period (brought forward)`
                : `Opening balance — ${openingName} — before first listed day (brought forward)`
              : usedExplicitFrom
                ? 'Opening balance — all entries before period (brought forward)'
                : 'Opening balance — all entries before first listed day (brought forward)',
          debit: drOb,
          credit: crOb,
        };
        rowsWithOpening = [openingRow, ...enrichedRows];
      }
    }

    let runningBalance = 0;
    return rowsWithOpening.map((row) => {
      const debit = row.debit ?? 0;
      const credit = row.credit ?? 0;
      runningBalance += debit - credit;
      return {
        date: row.date,
        voucherNumber: row.voucherNumber,
        accountNumber: row.accountNumber,
        accountName: row.accountName,
        accountType: row.accountType,
        description: row.description,
        debit,
        credit,
        runningBalance,
      };
    });
  }

  async getProfitAndLoss(
    startDate: string,
    endDate: string,
  ): Promise<ProfitAndLoss> {
    const brand = this.getBrand();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const rows = await this.getModel(brand).aggregate<
      PLAccountLine & { parentAccount: string }
    >([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$accountNumber',
          totalDebit: { $sum: { $ifNull: ['$debit', 0] } },
          totalCredit: { $sum: { $ifNull: ['$credit', 0] } },
        },
      },
      {
        $lookup: {
          from: 'chartofaccounts',
          localField: '_id',
          foreignField: 'selectedCode',
          as: 'account',
        },
      },
      // Drop JV entries whose accountNumber has no matching CoA record
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: false } },
      {
        $match: {
          'account.parentAccount': { $in: ['Revenue', 'Expense'] },
        },
      },
      {
        $project: {
          _id: 0,
          accountNumber: '$_id',
          accountName: '$account.accountName',
          accountType: '$account.accountType',
          parentAccount: '$account.parentAccount',
          totalDebit: 1,
          totalCredit: 1,
          netAmount: {
            $cond: {
              if: { $eq: ['$account.parentAccount', 'Revenue'] },
              then: { $subtract: ['$totalCredit', '$totalDebit'] },
              else: { $subtract: ['$totalDebit', '$totalCredit'] },
            },
          },
        },
      },
      { $sort: { parentAccount: 1, accountNumber: 1 } },
    ]);

    const revenueLines = rows.filter((r) => r.parentAccount === 'Revenue');
    const expenseLines = rows.filter((r) => r.parentAccount === 'Expense');

    const totalRevenue = revenueLines.reduce((s, r) => s + r.netAmount, 0);
    const totalExpenses = expenseLines.reduce((s, r) => s + r.netAmount, 0);

    return {
      period: { startDate, endDate },
      revenue: { lines: revenueLines, total: totalRevenue },
      expenses: { lines: expenseLines, total: totalExpenses },
      netProfit: totalRevenue - totalExpenses,
    };
  }

  async getTrialBalance(
    startDate?: string,
    endDate?: string,
  ): Promise<TrialBalanceRow[]> {
    const brand = this.getBrand();
    const chartCollection = this.getChartModel(brand).collection.name;

    const dateFilter: Record<string, Date> = {};
    if (startDate) {
      const d = new Date(startDate);
      d.setHours(0, 0, 0, 0);
      dateFilter['$gte'] = d;
    }
    if (endDate) {
      const d = new Date(endDate);
      d.setHours(23, 59, 59, 999);
      dateFilter['$lte'] = d;
    }
    const match: Record<string, unknown> = {};
    if (Object.keys(dateFilter).length) {
      match['date'] = dateFilter;
    }

    return this.getModel(brand).aggregate<TrialBalanceRow>([
      { $match: match },
      {
        $group: {
          _id: '$accountNumber',
          totalDebit: { $sum: { $ifNull: ['$debit', 0] } },
          totalCredit: { $sum: { $ifNull: ['$credit', 0] } },
        },
      },
      // Join CoA using accountCode — same lookup as General Ledger
      {
        $lookup: {
          from: chartCollection,
          localField: '_id',
          foreignField: 'accountCode',
          as: 'coaDoc',
        },
      },
      { $unwind: { path: '$coaDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          accountNumber: '$_id',
          accountName: { $ifNull: ['$coaDoc.accountName', '$_id'] },
          accountType: { $ifNull: ['$coaDoc.accountType', ''] },
          parentAccount: { $ifNull: ['$coaDoc.parentAccount', ''] },
          totalDebit: 1,
          totalCredit: 1,
          netBalance: { $subtract: ['$totalDebit', '$totalCredit'] },
        },
      },
      { $sort: { accountNumber: 1 } },
    ]);
  }

  async getAccountsReceivable(): Promise<ARCustomer[]> {
    const brand = this.getBrand();
    const chartCollection = this.getChartModel(brand).collection.name;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    return this.getModel(brand).aggregate<ARCustomer>([
      // 1. Only Accounts Receivable entries (account codes starting with '14')
      { $match: { accountNumber: { $regex: '^14', $options: 'i' } } },

      // 2. Days elapsed since each JV entry date
      {
        $addFields: {
          daysSince: {
            $divide: [{ $subtract: ['$$NOW', '$date'] }, MS_PER_DAY],
          },
        },
      },

      // 3. Aging bucket (used only for “current” ≤30d gross debit/credit)
      {
        $addFields: {
          bucket: {
            $switch: {
              branches: [
                { case: { $lte: ['$daysSince', 30] }, then: 'current' },
                { case: { $lte: ['$daysSince', 60] }, then: 'd3160' },
                { case: { $lte: ['$daysSince', 90] }, then: 'd6190' },
              ],
              default: 'd90plus',
            },
          },
        },
      },

      // 4. Group by account: lifetime totals + current-window (≤30d) gross debit/credit
      {
        $group: {
          _id: '$accountNumber',
          totalDebit: { $sum: { $ifNull: ['$debit', 0] } },
          totalCredit: { $sum: { $ifNull: ['$credit', 0] } },
          currentDebit: {
            $sum: {
              $cond: [
                { $eq: ['$bucket', 'current'] },
                { $ifNull: ['$debit', 0] },
                0,
              ],
            },
          },
          currentCredit: {
            $sum: {
              $cond: [
                { $eq: ['$bucket', 'current'] },
                { $ifNull: ['$credit', 0] },
                0,
              ],
            },
          },
        },
      },

      // 5. Join CoA for human-readable account name
      {
        $lookup: {
          from: chartCollection,
          localField: '_id',
          foreignField: 'accountCode',
          as: 'coaDoc',
        },
      },
      { $unwind: { path: '$coaDoc', preserveNullAndEmptyArrays: true } },

      // 6. Final projection (opening from CoA; closing = net receivable on JVs)
      {
        $project: {
          _id: 0,
          accountNumber: '$_id',
          accountName: { $ifNull: ['$coaDoc.accountName', '$_id'] },
          openingDebit: { $ifNull: ['$coaDoc.debit', 0] },
          openingCredit: { $ifNull: ['$coaDoc.credit', 0] },
          currentDebit: 1,
          currentCredit: 1,
          closingBalance: {
            $subtract: ['$totalDebit', '$totalCredit'],
          },
        },
      },

      // 7. Only accounts with a positive closing (net) receivable
      { $match: { closingBalance: { $gt: 0 } } },
      { $sort: { closingBalance: -1 } },
    ]);
  }

  /**
   * Sale invoices posted to this receivable account (14xx), newest first.
   * Used when recording cash/bank receipts in journal vouchers against open customer balances.
   */
  async getPendingReceivableInvoices(
    accountNumber: string,
  ): Promise<PendingReceivableInvoiceRow[]> {
    const code = accountNumber.split('-')[0].trim();
    if (!code || !/^14/i.test(code)) {
      return [];
    }
    const brand = this.getBrand();
    const saleModel = this.getSaleModel(brand);
    const rx = new RegExp(`^${escapeRegex(code)}(?:\\s|$|-)`, 'i');
    const invoices = await saleModel
      .find({ accountNumber: rx })
      .sort({ invoiceDate: -1 })
      .lean()
      .exec();

    return (invoices as any[]).map((inv) => {
      const products = Array.isArray(inv.products) ? inv.products : [];
      const totalAmount = products.reduce(
        (s: number, p: { netAmount?: number }) =>
          s + (Number(p?.netAmount) || 0),
        0,
      );
      const d = inv.invoiceDate ? new Date(inv.invoiceDate) : new Date();
      return {
        invoiceNumber: String(inv.invoiceNumber ?? ''),
        invoiceDate: Number.isNaN(d.getTime())
          ? ''
          : d.toISOString().slice(0, 10),
        accountTitle: String(inv.accountTitle ?? ''),
        totalAmount,
      };
    });
  }

  async getAccountsPayable(): Promise<APVendor[]> {
    const brand = this.getBrand();
    const chartCollection = this.getChartModel(brand).collection.name;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    return this.getModel(brand).aggregate<APVendor>([
      // 1. Only Accounts Payable entries (account codes starting with '2' — Liabilities)
      { $match: { accountNumber: { $regex: '^2', $options: 'i' } } },

      // 2. Days elapsed since each JV entry date
      {
        $addFields: {
          daysSince: {
            $divide: [{ $subtract: ['$$NOW', '$date'] }, MS_PER_DAY],
          },
        },
      },

      // 3. Aging bucket + net entry (credit − debit for credit-normal payables)
      {
        $addFields: {
          bucket: {
            $switch: {
              branches: [
                { case: { $lte: ['$daysSince', 30] }, then: 'current' },
                { case: { $lte: ['$daysSince', 60] }, then: 'd3160' },
                { case: { $lte: ['$daysSince', 90] }, then: 'd6190' },
              ],
              default: 'd90plus',
            },
          },
          netEntry: {
            $subtract: [
              { $ifNull: ['$credit', 0] },
              { $ifNull: ['$debit', 0] },
            ],
          },
        },
      },

      // 4. Group by account, accumulate totals and per-bucket sums
      {
        $group: {
          _id: '$accountNumber',
          totalDebit: { $sum: { $ifNull: ['$debit', 0] } },
          totalCredit: { $sum: { $ifNull: ['$credit', 0] } },
          current: {
            $sum: { $cond: [{ $eq: ['$bucket', 'current'] }, '$netEntry', 0] },
          },
          d3160: {
            $sum: { $cond: [{ $eq: ['$bucket', 'd3160'] }, '$netEntry', 0] },
          },
          d6190: {
            $sum: { $cond: [{ $eq: ['$bucket', 'd6190'] }, '$netEntry', 0] },
          },
          d90plus: {
            $sum: { $cond: [{ $eq: ['$bucket', 'd90plus'] }, '$netEntry', 0] },
          },
        },
      },

      // 5. Join CoA for human-readable account name
      {
        $lookup: {
          from: chartCollection,
          localField: '_id',
          foreignField: 'accountCode',
          as: 'coaDoc',
        },
      },
      { $unwind: { path: '$coaDoc', preserveNullAndEmptyArrays: true } },

      // 6. Final projection (outstanding = credit − debit for payables)
      {
        $project: {
          _id: 0,
          accountNumber: '$_id',
          accountName: { $ifNull: ['$coaDoc.accountName', '$_id'] },
          outstanding: { $subtract: ['$totalCredit', '$totalDebit'] },
          current: 1,
          days31to60: '$d3160',
          days61to90: '$d6190',
          days90plus: '$d90plus',
        },
      },

      // 7. Only accounts with a positive outstanding balance
      { $match: { outstanding: { $gt: 0 } } },
      { $sort: { outstanding: -1 } },
    ]);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const brand = this.getBrand();
    const saleModel = this.getSaleModel(brand);
    const productModel = this.getProductModel(brand);
    const jvModel = this.getModel(brand);

    // Sums products[].netAmount per invoice document without $unwind
    const invoiceSumExpr = {
      $reduce: {
        input: '$products',
        initialValue: 0,
        in: { $add: ['$$value', { $ifNull: ['$$this.netAmount', 0] }] },
      },
    };

    // Shared JV pipeline stages for receivables / payables
    const jvLookupPipeline = [
      {
        $group: {
          _id: '$accountNumber',
          totalDebit: { $sum: { $ifNull: ['$debit', 0] } },
          totalCredit: { $sum: { $ifNull: ['$credit', 0] } },
        },
      },
      {
        $lookup: {
          from: 'chartofaccounts',
          localField: '_id',
          foreignField: 'selectedCode',
          as: 'account',
        },
      },
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: false } },
    ];

    const [
      currentMonthAgg,
      lastMonthAgg,
      receivablesAgg,
      payablesAgg,
      topProductsAgg,
      lowStockDocs,
      trendAgg,
    ] = await Promise.all([
      // Current month invoice totals
      saleModel.aggregate([
        { $match: { invoiceDate: { $gte: thisMonthStart } } },
        { $project: { invoiceTotal: invoiceSumExpr } },
        {
          $group: {
            _id: null,
            total: { $sum: '$invoiceTotal' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Last month invoice totals
      saleModel.aggregate([
        {
          $match: {
            invoiceDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        { $project: { invoiceTotal: invoiceSumExpr } },
        {
          $group: {
            _id: null,
            total: { $sum: '$invoiceTotal' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Total receivables (debit-normal accounts)
      jvModel.aggregate([
        ...jvLookupPipeline,
        {
          $match: {
            'account.accountType': {
              $in: ['1400-Receivables', '1410-Receivables Accounts'],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $subtract: ['$totalDebit', '$totalCredit'] } },
          },
        },
      ]),

      // Total payables (credit-normal accounts)
      jvModel.aggregate([
        ...jvLookupPipeline,
        {
          $match: {
            'account.accountType': {
              $in: ['2110-AccountsPayable', '2210-Purchase Party'],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $subtract: ['$totalCredit', '$totalDebit'] } },
          },
        },
      ]),

      // Top 5 products by total revenue
      saleModel.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: {
              code: '$products.code',
              productName: '$products.productName',
            },
            totalRevenue: { $sum: '$products.netAmount' },
            totalQtySold: { $sum: '$products.quantity' },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            code: '$_id.code',
            productName: '$_id.productName',
            totalRevenue: 1,
            totalQtySold: 1,
          },
        },
      ]),

      // Products where quantity < minimumStockLevel
      productModel
        .find({ $expr: { $lt: ['$quantity', '$minimumStockLevel'] } })
        .select('code productName quantity minimumStockLevel')
        .lean()
        .exec(),

      // Monthly sales trend: last 6 months
      saleModel.aggregate([
        { $match: { invoiceDate: { $gte: sixMonthsAgo } } },
        { $project: { invoiceDate: 1, invoiceTotal: invoiceSumExpr } },
        {
          $group: {
            _id: {
              year: { $year: '$invoiceDate' },
              month: { $month: '$invoiceDate' },
            },
            total: { $sum: '$invoiceTotal' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Build 6-month array with zero-filling for months that have no sales
    const trendMap = new Map<string, number>();
    for (const row of trendAgg) {
      const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
      trendMap.set(key, row.total);
    }
    const monthlySalesTrend: MonthlySales[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      monthlySalesTrend.push({ month: label, total: trendMap.get(key) ?? 0 });
    }

    return {
      currentMonthSales: currentMonthAgg[0]?.total ?? 0,
      lastMonthSales: lastMonthAgg[0]?.total ?? 0,
      totalReceivables: receivablesAgg[0]?.total ?? 0,
      totalPayables: payablesAgg[0]?.total ?? 0,
      topProducts: topProductsAgg as TopProduct[],
      lowStockProducts: (lowStockDocs as any[]).map((p) => ({
        code: p.code,
        productName: p.productName,
        quantity: p.quantity ?? 0,
        minimumStockLevel: p.minimumStockLevel ?? 0,
      })),
      monthlySalesTrend,
    };
  }
}
