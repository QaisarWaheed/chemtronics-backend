import {
  Inject,
  Injectable,
  Scope,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SaleInvoice } from '../entities/saleInvoice.entity';
import { CreateSaleInvoiceDto } from '../dto/createSaleInvoice.dto';
import { UpdateSaleInvoiceDto } from '../dto/updateSaleInvoice.dto';
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
export class SaleInvoiceService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(SaleInvoice.name, 'chemtronics')
    private saleInvoiceModel: Model<SaleInvoice>,
    @InjectModel(SaleInvoice.name, 'hydroworx')
    private saleInvoiceModel2: Model<SaleInvoice>,
    @InjectModel(Products.name, 'chemtronics')
    private productsModel: Model<Products>,
    @InjectModel(JournalVoucher.name, 'chemtronics')
    private journalModel: Model<JournalVoucher>,
    @InjectModel(JournalVoucher.name, 'hydroworx')
    private journalModel2: Model<JournalVoucher>,
    @InjectModel('DeliveryChalan', 'chemtronics')
    private deliveryChalanModel: Model<any>,
    @InjectModel('DeliveryChalan', 'hydroworx')
    private deliveryChalanModel2: Model<any>,
    @InjectConnection('chemtronics') private connChemtronics: Connection,
    @InjectConnection('hydroworx') private connHydroworx: Connection,
    private readonly auditLogService: AuditLogService,
  ) {}

  private getBrand(): string {
    const brand = ((this.req['brand'] as string) || 'chemtronics')
      .toLowerCase()
      .trim();
    console.log('Incoming Header x-brand:', brand);
    return brand;
  }

  private getModel(brand: string): Model<SaleInvoice> {
    const model =
      brand === 'hydroworx' ? this.saleInvoiceModel2 : this.saleInvoiceModel;
    console.log('ACTIVE DB:', model.db.name, '| Brand:', brand);
    return model;
  }

  // Shared inventory: always use chemtronics products collection
  private getProductModel(): Model<Products> {
    return this.productsModel;
  }

  private getJournalModel(brand: string): Model<JournalVoucher> {
    return brand === 'hydroworx' ? this.journalModel2 : this.journalModel;
  }

  private getConnection(brand: string): Connection {
    return brand === 'hydroworx' ? this.connHydroworx : this.connChemtronics;
  }

  async create(createSaleInvoiceDto: CreateSaleInvoiceDto) {
    const brand = this.getBrand();
    const payload = { ...createSaleInvoiceDto } as any;

    // Enforce business rule: hydroworx invoices should have no tax
    if (brand === 'hydroworx' && Array.isArray(payload.products)) {
      payload.products = payload.products.map((p: any) => {
        const qty = Number(p.quantity) || 0;
        const rate = Number(p.rate) || 0;
        const exGstAmount = qty * rate;
        return {
          ...p,
          gstPercent: 0,
          exGstRate: 0,
          exGstAmount,
          netAmount: exGstAmount,
        };
      });
      payload.netAmount = payload.products.reduce(
        (s: number, it: any) => s + (Number(it.netAmount) || 0),
        0,
      );
      payload.amount = payload.netAmount;
    }

    // Normalize payload fields to match schema
    if (payload.account && !payload.accountNumber) {
      payload.accountNumber = payload.account;
    }

    // Compute total invoice value from product lines (sum of per-line netAmount)
    const invoiceTotal: number = (
      Array.isArray(payload.products) ? (payload.products as any[]) : []
    ).reduce((sum: number, p: any) => sum + (Number(p.netAmount) || 0), 0);

    const saleInvoiceModel = this.getModel(brand);
    const productModel = this.getProductModel();
    const journalVoucherModel = this.getJournalModel(brand);
    const conn = this.getConnection(brand);

    // NOTE: Mongoose transactions require a MongoDB Replica Set or Atlas cluster.
    // Standalone mongod instances do not support multi-document transactions.
    const session = await conn.startSession();
    let savedInvoice!: SaleInvoice;

    try {
      await session.withTransaction(async () => {
        // ── Step 1: Persist the sale invoice ────────────────────────────────
        const created = new saleInvoiceModel(payload);
        savedInvoice = await created.save({ session });

        // ── Step 2: Decrement stock for each sold product ───────────────────
        for (const item of payload.products as any[]) {
          // Normalise qty field — frontend sends 'qty', DTO uses 'quantity'
          const qty = Number(item.quantity ?? item.qty) || 0;
          if (qty <= 0) continue;

          // Atomic: only decrement if current quantity >= qty sold
          const result = await productModel.updateOne(
            { code: item.code, quantity: { $gte: qty } },
            { $inc: { quantity: -qty } },
            { session },
          );

          if (result.modifiedCount === 0) {
            // Either product doesn't exist or stock is insufficient — roll back
            throw new BadRequestException(
              `Insufficient stock or product not found for product code: ${item.code}`,
            );
          }
        }

        // ── Step 3: Create double-entry journal voucher rows ─────────────────
        // Both rows share the same voucherNumber (= invoiceNumber) so the
        // JournalVouchers page can group them into one balanced entry.
        const voucherNumber: string = payload.invoiceNumber;
        const entryDate: Date = payload.invoiceDate
          ? new Date(payload.invoiceDate)
          : new Date();

        await journalVoucherModel.insertMany(
          [
            {
              // DR Accounts Receivable (customer owes us)
              voucherNumber,
              date: entryDate,
              accountNumber: sanitizeCode(payload.accountNumber),
              description: `Sale Invoice ${voucherNumber}`,
              debit: invoiceTotal,
            },
            {
              // CR Sales Revenue (revenue earned)
              voucherNumber,
              date: entryDate,
              accountNumber: sanitizeCode(payload.saleAccount),
              description: `Sale Invoice ${voucherNumber}`,
              credit: invoiceTotal,
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
        module: 'SaleInvoice',
        description: `Created Sale Invoice ${savedInvoice.invoiceNumber}`,
      });

      return savedInvoice;
    } catch (error: any) {
      console.error('SaleInvoiceService.create error:', error);
      if (error instanceof BadRequestException) throw error;
      if (error?.name === 'ValidationError')
        throw new BadRequestException(error.message);
      if (error?.code === 11000)
        throw new BadRequestException(
          'Duplicate key error: possible duplicate invoiceNumber',
        );
      throw new InternalServerErrorException(
        error?.message || 'Failed to create sale invoice',
      );
    } finally {
      await session.endSession();
    }
  }

  async findAll() {
    const brand = this.getBrand();
    const saleInvoiceModel = this.getModel(brand);
    return saleInvoiceModel.find().exec();
  }

  async search(searchTerm?: string) {
    const brand = this.getBrand();
    const saleInvoiceModel = this.getModel(brand);
    const query: any = {};

    // Case-insensitive multi-field search
    if (searchTerm && searchTerm.trim()) {
      query.$or = [
        { invoiceNumber: { $regex: searchTerm, $options: 'i' } },
        { accountTitle: { $regex: searchTerm, $options: 'i' } },
        { 'products.code': { $regex: searchTerm, $options: 'i' } },
      ];
    }

    return saleInvoiceModel.find(query).exec();
  }

  async findOne(id: string) {
    const brand = this.getBrand();
    const saleInvoiceModel = this.getModel(brand);
    return saleInvoiceModel.findById(id).exec();
  }

  async update(id: string, updateSaleInvoiceDto: UpdateSaleInvoiceDto) {
    const brand = this.getBrand();
    const saleInvoiceModel = this.getModel(brand);
    const productModel = this.getProductModel();
    const journalVoucherModel = this.getJournalModel(brand);
    const conn = this.getConnection(brand);

    // Fetch old invoice so we know what stock was previously deducted
    const oldInvoice = await saleInvoiceModel.findById(id).lean().exec();
    if (!oldInvoice) {
      throw new BadRequestException(`Sale invoice not found: ${id}`);
    }

    const dto = updateSaleInvoiceDto as any;

    // Normalize account field (DTO uses 'account', entity uses 'accountNumber')
    if (dto.account && !dto.accountNumber) dto.accountNumber = dto.account;
    else if (dto.accountNumber && !dto.account) dto.account = dto.accountNumber;

    // Accept products from either 'products' or 'items' field name
    const newProducts: any[] = Array.isArray(dto.products)
      ? dto.products
      : Array.isArray(dto.items)
        ? dto.items
        : [];

    // Normalise per-item field aliases (frontend may send qty/product instead of quantity/productName)
    const normalisedProducts = newProducts.map((p: any) => ({
      ...p,
      quantity: Number(p.quantity ?? p.qty) || 0,
      productName: p.productName ?? p.product ?? '',
    }));

    const invoiceTotal = normalisedProducts.reduce(
      (s: number, p: any) =>
        s + (Number(p.netAmount) || p.quantity * p.rate || 0),
      0,
    );

    const session = await conn.startSession();
    let updatedInvoice!: SaleInvoice;

    try {
      await session.withTransaction(async () => {
        // ── Step 1: Restore stock from the old invoice (reverse original sale) ─
        for (const item of (oldInvoice.products as any[]) ?? []) {
          const qty = Number(item.quantity) || 0;
          if (qty <= 0) continue;
          await productModel.updateOne(
            { code: item.code },
            { $inc: { quantity: qty } },
            { session },
          );
        }

        // ── Step 2: Deduct stock for the new quantities ───────────────────────
        for (const item of normalisedProducts) {
          const qty = item.quantity;
          if (qty <= 0) continue;
          const result = await productModel.updateOne(
            { code: item.code, quantity: { $gte: qty } },
            { $inc: { quantity: -qty } },
            { session },
          );
          if (result.modifiedCount === 0) {
            throw new BadRequestException(
              `Insufficient stock or product not found for product code: ${item.code}`,
            );
          }
        }

        // ── Step 3: Replace journal voucher entries ───────────────────────────
        await journalVoucherModel.deleteMany(
          { voucherNumber: (oldInvoice as any).invoiceNumber },
          { session },
        );
        const voucherNumber =
          dto.invoiceNumber || (oldInvoice as any).invoiceNumber;
        const entryDate = dto.invoiceDate
          ? new Date(dto.invoiceDate)
          : new Date();
        const accountNumber = sanitizeCode(
          dto.accountNumber || dto.account || '',
        );
        const saleAccount = sanitizeCode(dto.saleAccount || '');
        if (invoiceTotal > 0 && accountNumber && saleAccount) {
          await journalVoucherModel.insertMany(
            [
              {
                voucherNumber,
                date: entryDate,
                accountNumber,
                description: `Sale Invoice ${voucherNumber}`,
                debit: invoiceTotal,
              },
              {
                voucherNumber,
                date: entryDate,
                accountNumber: saleAccount,
                description: `Sale Invoice ${voucherNumber}`,
                credit: invoiceTotal,
              },
            ],
            { session },
          );
        }

        // ── Step 4: Persist the updated invoice ───────────────────────────────
        updatedInvoice = (await saleInvoiceModel
          .findByIdAndUpdate(
            id,
            { ...dto, products: normalisedProducts },
            { new: true, session },
          )
          .exec()) as SaleInvoice;
      });

      const user = this.req.user as JwtPayload | undefined;
      this.auditLogService.log({
        userId: user?.sub ?? 'unknown',
        userName: user?.userName ?? 'unknown',
        brand: this.getBrand(),
        action: 'UPDATE',
        module: 'SaleInvoice',
        description: `Updated Sale Invoice ${(oldInvoice as any).invoiceNumber}`,
      });

      return updatedInvoice;
    } catch (error: any) {
      console.error('SaleInvoiceService.update error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to update sale invoice',
      );
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string) {
    const brand = this.getBrand();
    const saleInvoiceModel = this.getModel(brand);
    const productModel = this.getProductModel();
    const journalVoucherModel = this.getJournalModel(brand);
    const conn = this.getConnection(brand);

    // Fetch the invoice first so we know what to reverse
    const invoice = await saleInvoiceModel.findById(id).lean().exec();
    if (!invoice) {
      throw new BadRequestException(`Sale invoice not found: ${id}`);
    }

    const session = await conn.startSession();
    try {
      await session.withTransaction(async () => {
        // ── Step 1: Delete the invoice ───────────────────────────────────────
        await saleInvoiceModel.findByIdAndDelete(id, { session });

        // ── Step 2: Restore stock for every product line ─────────────────────
        for (const item of (invoice.products as any[]) ?? []) {
          const qty = Number(item.quantity) || 0;
          if (qty <= 0) continue;
          await productModel.updateOne(
            { code: item.code },
            { $inc: { quantity: qty } },
            { session },
          );
        }

        // ── Step 3: Reverse journal voucher rows by voucherNumber ────────────
        // Deletes both the DR and CR rows that were created on invoice creation.
        await journalVoucherModel.deleteMany(
          { voucherNumber: invoice.invoiceNumber },
          { session },
        );
      });

      const user = this.req.user as JwtPayload | undefined;
      this.auditLogService.log({
        userId: user?.sub ?? 'unknown',
        userName: user?.userName ?? 'unknown',
        brand: this.getBrand(),
        action: 'DELETE',
        module: 'SaleInvoice',
        description: `Deleted Sale Invoice ${invoice.invoiceNumber}`,
      });

      return { deleted: true, invoiceNumber: invoice.invoiceNumber };
    } catch (error: any) {
      console.error('SaleInvoiceService.remove error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete sale invoice',
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Converts a DeliveryChalan to a SaleInvoice
   * @param deliveryChallanId DeliveryChalan Mongo _id or id
   */
  async convertFromDeliveryChallan(deliveryChallanId: string) {
    const brand = this.getBrand();
    const conn = this.getConnection(brand);
    const model =
      brand === 'hydroworx'
        ? this['deliveryChalanModel2']
        : this['deliveryChalanModel'];
    const mongoose = require('mongoose');
    let chalanDoc;
    if (mongoose.isValidObjectId(deliveryChallanId)) {
      chalanDoc = await model.findById(deliveryChallanId).lean().exec();
    } else {
      chalanDoc = await model.findOne({ id: deliveryChallanId }).lean().exec();
    }
    if (!chalanDoc) throw new BadRequestException('DeliveryChalan not found');

    // Generate a new invoice number
    const saleInvoiceModel = this.getModel(brand);
    const latestInvoice = await saleInvoiceModel
      .findOne({}, { invoiceNumber: 1 })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    let nextNum = 1001;
    if (latestInvoice && latestInvoice.invoiceNumber) {
      const m = String(latestInvoice.invoiceNumber).match(/(\d+)$/);
      if (m) nextNum = parseInt(m[1], 10) + 1;
    }
    const invoiceNumber = `INV-${nextNum}`;

    // Map chalan items to sale invoice products
    const products = (chalanDoc.items || []).map((item: any) => ({
      code: item.itemCode ? Number(item.itemCode) : undefined,
      productName: item.particulars,
      hsCode: '',
      quantity: Number(item.qty) || 0,
      rate: item.amount ? Number(item.amount) / (Number(item.qty) || 1) : 0,
      netAmount: item.amount || 0,
      gstPercent: 0,
      exGstRate: 0,
      exGstAmount: 0,
    }));

    // Compose DTO
    const dto: CreateSaleInvoiceDto = {
      computerNumber: invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      deliveryNumber: chalanDoc.id,
      deliveryDate: chalanDoc.deliveryDate
        ? new Date(chalanDoc.deliveryDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      poNumber: chalanDoc.poNo,
      poDate: chalanDoc.poDate
        ? new Date(chalanDoc.poDate).toISOString().split('T')[0]
        : undefined,
      account: chalanDoc.partyName || 'Unknown',
      accountTitle: chalanDoc.partyName || 'Unknown',
      saleAccount: '4000',
      saleAccountTitle: 'Sales',
      products,
      invoiceNumber,
    };

    // Create the SaleInvoice using the existing create logic
    const created = await this.create(dto);
    return created;
  }
}
