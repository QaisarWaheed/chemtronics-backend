import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PurchaseInvoice } from '../entities/purchaseInvoice.entity';
import { CreatePurchaseInvoiceDto } from '../dto/createPurchaseInvoice.dto';
import { UpdatePurchaseInvoiceDto } from '../dto/updatePurchaseInvoice.dto';
import { REQUEST } from '@nestjs/core';
import { Products } from '../../../products/entities/product.entity';
import { JournalVoucher } from '../../../accounts/journalVoucher/entities/journal-voucher/journal-voucher';
import { AuditLogService } from '../../../audit-log/audit-log.service';
import { JwtPayload } from '../../../auth/strategies/jwt.strategy';

/** Returns only the numeric/alphanumeric code portion from strings like '1410-Receivables Accounts' → '1410' */
function sanitizeCode(raw: string | null | undefined): string {
  return (raw ?? '').toString().split('-')[0].trim();
}

@Injectable({ scope: Scope.REQUEST })
export class PurchaseInvoiceService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(PurchaseInvoice.name, 'chemtronics')
    private purchaseInvoiceModel: Model<PurchaseInvoice>,
    @InjectModel(PurchaseInvoice.name, 'hydroworx')
    private purchaseInvoiceModel2: Model<PurchaseInvoice>,
    @InjectModel(Products.name, 'chemtronics')
    private productsModel: Model<Products>,
    @InjectModel(JournalVoucher.name, 'chemtronics')
    private journalModel: Model<JournalVoucher>,
    @InjectModel(JournalVoucher.name, 'hydroworx')
    private journalModel2: Model<JournalVoucher>,
    @InjectConnection('chemtronics') private connChemtronics: Connection,
    @InjectConnection('hydroworx') private connHydroworx: Connection,
    private readonly auditLogService: AuditLogService,
  ) {}

  private getBrand(): string {
    return this.req['brand'] || 'chemtronics';
  }

  private getModel(): Model<PurchaseInvoice> {
    return this.getBrand() === 'hydroworx'
      ? this.purchaseInvoiceModel2
      : this.purchaseInvoiceModel;
  }

  // Shared inventory: always use chemtronics products collection
  private getProductModel(): Model<Products> {
    return this.productsModel;
  }

  private getJournalModel(): Model<JournalVoucher> {
    return this.getBrand() === 'hydroworx'
      ? this.journalModel2
      : this.journalModel;
  }

  private getConnection(): Connection {
    return this.getBrand() === 'hydroworx'
      ? this.connHydroworx
      : this.connChemtronics;
  }

  async createPurchaseInvoice(
    data: CreatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoice> {
    const purchaseInvoiceModel = this.getModel();
    const productModel = this.getProductModel();
    const journalVoucherModel = this.getJournalModel();
    const conn = this.getConnection();

    const session = await conn.startSession();
    let savedInvoice!: PurchaseInvoice;
    let voucherNumber = '';

    try {
      await session.withTransaction(async () => {
        // ── Step 1: Persist the purchase invoice ────────────────────────────
        [savedInvoice] = await purchaseInvoiceModel.create([data], { session });

        // ── Step 2: Increase stock for each purchased item ───────────────────
        for (const item of data.items ?? []) {
          // Purchase items carry price/unit — treat unit as quantity received
          const qty = Number(item.unit) || 0;
          if (qty <= 0) continue;
          await productModel.updateOne(
            { code: item.code },
            { $inc: { quantity: qty } },
            { session },
          );
        }

        // ── Step 3: Double-entry journal voucher ─────────────────────────────
        //   DR Inventory / Stock   (asset increases)
        //   CR Accounts Payable    (liability increases — we owe the supplier)
        // voucherNumber = invoiceNumber (or partyBillNumber as fallback)
        voucherNumber = String(
          data.invoiceNumber || data.partyBillNumber || '',
        );
        const entryDate: Date = data.invoiceDate
          ? new Date(data.invoiceDate)
          : new Date();
        const total = Number(data.totalAmount) || 0;

        // purchaseAccount holds the inventory/stock GL code;
        // supplier.code is the payable party code.
        await journalVoucherModel.insertMany(
          [
            {
              // DR Inventory (stock asset rises)
              voucherNumber,
              date: entryDate,
              accountNumber: sanitizeCode(data.purchaseAccount),
              description: `Purchase Invoice ${voucherNumber}`,
              debit: total,
            },
            {
              // CR Accounts Payable (we owe the supplier)
              voucherNumber,
              date: entryDate,
              accountNumber: sanitizeCode(String(data.supplier?.code ?? '')),
              description: `Purchase Invoice ${voucherNumber}`,
              credit: total,
            },
          ],
          { session },
        );
      });

      const user = this.req.user as JwtPayload | undefined;
      this.auditLogService.log({
        userId: user?.sub ?? 'unknown',
        userName: user?.userName ?? 'unknown',
        brand: this.getBrand(),
        action: 'CREATE',
        module: 'PurchaseInvoice',
        description: `Created Purchase Invoice ${voucherNumber}`,
      });

      return savedInvoice;
    } catch (error: any) {
      console.error(
        'PurchaseInvoiceService.createPurchaseInvoice error:',
        error,
      );
      if (error instanceof BadRequestException) throw error;
      if (error?.name === 'ValidationError')
        throw new BadRequestException(error.message);
      if (error?.code === 11000)
        throw new BadRequestException(
          'Duplicate key error: possible duplicate invoiceNumber',
        );
      throw new InternalServerErrorException(
        error?.message || 'Failed to create purchase invoice',
      );
    } finally {
      await session.endSession();
    }
  }

  async getAllPurchaseInvoices(): Promise<PurchaseInvoice[]> {
    const purchaseInvoiceModel = this.getModel();
    return purchaseInvoiceModel.find().exec();
  }

  async search(searchTerm?: string): Promise<PurchaseInvoice[]> {
    const purchaseInvoiceModel = this.getModel();
    const query: any = {};

    // Case-insensitive multi-field search
    if (searchTerm && searchTerm.trim()) {
      query.$or = [
        { invoiceNumber: { $regex: searchTerm, $options: 'i' } },
        { vendorName: { $regex: searchTerm, $options: 'i' } },
        { 'products.code': { $regex: searchTerm, $options: 'i' } },
      ];
    }

    return purchaseInvoiceModel.find(query).exec();
  }

  async getPurchaseInvoiceById(id: string): Promise<PurchaseInvoice | null> {
    const purchaseInvoiceModel = this.getModel();
    return purchaseInvoiceModel.findById(id).exec();
  }

  async updatePurchaseInvoice(
    id: string,
    data: Partial<UpdatePurchaseInvoiceDto>,
  ): Promise<PurchaseInvoice | null> {
    const purchaseInvoiceModel = this.getModel();
    return purchaseInvoiceModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async deletePurchaseInvoice(
    id: string,
  ): Promise<{ deleted: boolean; invoiceNumber: string }> {
    const purchaseInvoiceModel = this.getModel();
    const productModel = this.getProductModel();
    const journalVoucherModel = this.getJournalModel();
    const conn = this.getConnection();

    // Load invoice before opening session (short-circuit fast if not found)
    const invoice = await purchaseInvoiceModel.findById(id).lean().exec();
    if (!invoice) {
      throw new BadRequestException(`Purchase invoice not found: ${id}`);
    }

    const voucherNumber = String(
      (invoice as any).invoiceNumber || (invoice as any).partyBillNumber || '',
    );

    const session = await conn.startSession();
    try {
      await session.withTransaction(async () => {
        // ── Step 1: Delete the invoice ───────────────────────────────────────
        await purchaseInvoiceModel.findByIdAndDelete(id, { session });

        // ── Step 2: Reverse stock increments (subtract qty back out) ─────────
        for (const item of (invoice as any).items ?? []) {
          const qty = Number(item.unit) || 0;
          if (qty <= 0) continue;
          await productModel.updateOne(
            { code: item.code },
            { $inc: { quantity: -qty } },
            { session },
          );
        }

        // ── Step 3: Delete the journal voucher rows created on save ──────────
        if (voucherNumber) {
          await journalVoucherModel.deleteMany({ voucherNumber }, { session });
        }
      });

      const user = this.req.user as JwtPayload | undefined;
      this.auditLogService.log({
        userId: user?.sub ?? 'unknown',
        userName: user?.userName ?? 'unknown',
        brand: this.getBrand(),
        action: 'DELETE',
        module: 'PurchaseInvoice',
        description: `Deleted Purchase Invoice ${voucherNumber}`,
      });

      return { deleted: true, invoiceNumber: voucherNumber };
    } catch (error: any) {
      console.error(
        'PurchaseInvoiceService.deletePurchaseInvoice error:',
        error,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete purchase invoice',
      );
    } finally {
      await session.endSession();
    }
  }
}
