import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SaleReturn } from '../entities/saleReturn.entity';
import { CreateSaleReturnDto } from '../dto/createSaleReturn.dto';
import { UpdateSaleReturnDto } from '../dto/updateSaleReturn.dto';
import { REQUEST } from '@nestjs/core';
import { Products } from '../../../products/entities/product.entity';
import { JournalVoucher } from '../../../accounts/journalVoucher/entities/journal-voucher/journal-voucher';

/** Returns only the numeric/alphanumeric code portion from strings like '1410-Receivables Accounts' → '1410' */
function sanitizeCode(raw: string | null | undefined): string {
  return (raw ?? '').toString().split('-')[0].trim();
}

@Injectable({ scope: Scope.REQUEST })
export class SaleReturnService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(SaleReturn.name, 'chemtronics')
    private saleReturnModel: Model<SaleReturn>,
    @InjectModel(SaleReturn.name, 'hydroworx')
    private saleReturnModel2: Model<SaleReturn>,
    @InjectModel(Products.name, 'chemtronics')
    private productsModel: Model<Products>,
    @InjectModel(JournalVoucher.name, 'chemtronics')
    private journalModel: Model<JournalVoucher>,
    @InjectModel(JournalVoucher.name, 'hydroworx')
    private journalModel2: Model<JournalVoucher>,
    @InjectConnection('chemtronics') private connChemtronics: Connection,
    @InjectConnection('hydroworx') private connHydroworx: Connection,
  ) {}

  private getBrand(): string {
    const brand = ((this.req['brand'] as string) || 'chemtronics')
      .toLowerCase()
      .trim();
    console.log('Incoming Header x-brand:', brand);
    return brand;
  }

  private getModel(brand: string): Model<SaleReturn> {
    const model =
      brand === 'hydroworx' ? this.saleReturnModel2 : this.saleReturnModel;
    console.log(
      'Switching Model. Brand:',
      brand,
      '| Connection DB:',
      model.db.name,
    );
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

  async create(createSaleReturnDto: CreateSaleReturnDto) {
    const brand = this.getBrand();
    const productModel = this.getProductModel();
    const journalVoucherModel = this.getJournalModel(brand);
    const saleReturnModel = this.getModel(brand);
    const conn = this.getConnection(brand);

    // Total returnable value = sum of per-line netAmount
    const returnTotal: number = (
      Array.isArray(createSaleReturnDto.products)
        ? createSaleReturnDto.products
        : []
    ).reduce((sum, p) => sum + (Number(p.netAmount) || 0), 0);

    const session = await conn.startSession();
    let savedReturn!: SaleReturn;

    try {
      await session.withTransaction(async () => {
        // ── Step 1: Persist the sale return ─────────────────────────────────
        const created = new saleReturnModel(createSaleReturnDto);
        savedReturn = await created.save({ session });

        // ── Step 2: Restore stock for each returned product ──────────────────
        for (const item of createSaleReturnDto.products) {
          const qty = Number(item.quantity) || 0;
          if (qty <= 0) continue;
          await productModel.updateOne(
            { code: item.code },
            { $inc: { quantity: qty } },
            { session },
          );
        }

        // ── Step 3: Reverse double-entry journal voucher ──────────────────────
        // A sale return reverses the original sale:
        //   DR Sales Revenue / Sale Returns   (reverses the CR from the original sale)
        //   CR Accounts Receivable            (reverses the DR from the original sale)
        // voucherNumber = "RETURN-<invoiceNumber>" to avoid collision with the original.
        const voucherNumber = `RETURN-${createSaleReturnDto.invoiceNumber}`;
        const entryDate = createSaleReturnDto.invoiceDate
          ? new Date(createSaleReturnDto.invoiceDate)
          : new Date();

        await journalVoucherModel.insertMany(
          [
            {
              // DR Sales Revenue (reduces revenue — the return)
              voucherNumber,
              date: entryDate,
              accountNumber: sanitizeCode(createSaleReturnDto.saleAccount),
              description: `Sale Return for Invoice ${createSaleReturnDto.invoiceNumber}`,
              debit: returnTotal,
            },
            {
              // CR Accounts Receivable (customer no longer owes us)
              voucherNumber,
              date: entryDate,
              accountNumber: sanitizeCode(createSaleReturnDto.customer),
              description: `Sale Return for Invoice ${createSaleReturnDto.invoiceNumber}`,
              credit: returnTotal,
            },
          ],
          { session },
        );
      });

      return savedReturn;
    } catch (error: any) {
      console.error('SaleReturnService.create error:', error);
      if (error instanceof BadRequestException) throw error;
      if (error?.name === 'ValidationError')
        throw new BadRequestException(error.message);
      if (error?.code === 11000)
        throw new BadRequestException(
          'Duplicate key error: possible duplicate return number',
        );
      throw new InternalServerErrorException(
        error?.message || 'Failed to create sale return',
      );
    } finally {
      await session.endSession();
    }
  }

  async findAll() {
    const brand = this.getBrand();
    const saleReturnModel = this.getModel(brand);
    return saleReturnModel.find().exec();
  }

  async findOne(id: string) {
    const brand = this.getBrand();
    const saleReturnModel = this.getModel(brand);
    return saleReturnModel.findById(id).exec();
  }

  async update(id: string, updateSaleReturnDto: UpdateSaleReturnDto) {
    const brand = this.getBrand();
    const saleReturnModel = this.getModel(brand);
    return saleReturnModel
      .findByIdAndUpdate(id, updateSaleReturnDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    const brand = this.getBrand();
    const saleReturnModel = this.getModel(brand);
    return saleReturnModel.findByIdAndDelete(id).exec();
  }
}
