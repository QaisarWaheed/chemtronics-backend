import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PurchaseReturn } from '../entities/purchaseReturn.entity';
import { CreatePurchaseReturnDto } from '../dto/createPurchaseReturn.dto';
import { UpdatePurchaseReturnDto } from '../dto/updatePurchaseReturn.dto';
import { REQUEST } from '@nestjs/core';
import { Products } from '../../../products/entities/product.entity';
import { JournalVoucher } from '../../../accounts/journalVoucher/entities/journal-voucher/journal-voucher';

/** Returns only the numeric/alphanumeric code portion from strings like '2210-Purchase Party' → '2210' */
function sanitizeCode(raw: string | null | undefined): string {
  return (raw ?? '').toString().split('-')[0].trim();
}

@Injectable({ scope: Scope.REQUEST })
export class PurchaseReturnService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(PurchaseReturn.name, 'chemtronics')
    private purchaseReturnModel: Model<PurchaseReturn>,
    @InjectModel(PurchaseReturn.name, 'hydroworx')
    private purchaseReturnModel2: Model<PurchaseReturn>,
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

  private getModel(brand: string): Model<PurchaseReturn> {
    const model =
      brand === 'hydroworx'
        ? this.purchaseReturnModel2
        : this.purchaseReturnModel;
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

  private inventoryUsesDifferentMongoClient(
    productModel: Model<Products>,
    brandConn: Connection,
  ): boolean {
    return productModel.db.getClient() !== brandConn.getClient();
  }

  async create(createPurchaseReturnDto: CreatePurchaseReturnDto) {
    const brand = this.getBrand();
    const purchaseReturnModel = this.getModel(brand);
    const productModel = this.getProductModel();
    const journalVoucherModel = this.getJournalModel(brand);
    const conn = this.getConnection(brand);

    // Total value being returned = sum of per-line amount
    const returnTotal: number = (
      Array.isArray(createPurchaseReturnDto.products)
        ? createPurchaseReturnDto.products
        : []
    ).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const voucherNumber = `PRETURN-${createPurchaseReturnDto.invoiceNumber}`;
    const entryDate = createPurchaseReturnDto.invoiceDate
      ? new Date(createPurchaseReturnDto.invoiceDate)
      : new Date();

    let savedReturn!: PurchaseReturn;

    const runDecreaseStock = async (session: any) => {
      for (const item of createPurchaseReturnDto.products) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;
        await productModel.updateOne(
          { code: item.code },
          { $inc: { quantity: -qty } },
          { session },
        );
      }
    };

    const runReturnAndJournal = async (session: any) => {
      const created = new purchaseReturnModel(createPurchaseReturnDto);
      savedReturn = await created.save({ session });

      await journalVoucherModel.insertMany(
        [
          {
            voucherNumber,
            date: entryDate,
            accountNumber: sanitizeCode(
              createPurchaseReturnDto.supplier?.code ??
                createPurchaseReturnDto.supplier?.name ??
                '',
            ),
            description: `Purchase Return for Invoice ${createPurchaseReturnDto.invoiceNumber}`,
            debit: returnTotal,
          },
          {
            voucherNumber,
            date: entryDate,
            accountNumber: sanitizeCode(
              createPurchaseReturnDto.purchaseAccount ?? '',
            ),
            description: `Purchase Return for Invoice ${createPurchaseReturnDto.invoiceNumber}`,
            credit: returnTotal,
          },
        ],
        { session },
      );
    };

    try {
      if (this.inventoryUsesDifferentMongoClient(productModel, conn)) {
        const brandSession = await conn.startSession();
        try {
          await brandSession.withTransaction(() =>
            runReturnAndJournal(brandSession),
          );
        } finally {
          await brandSession.endSession();
        }

        const invSession = await this.connChemtronics.startSession();
        try {
          await invSession.withTransaction(() => runDecreaseStock(invSession));
        } catch (stockErr) {
          const rollback = await conn.startSession();
          try {
            await rollback.withTransaction(async () => {
              await purchaseReturnModel.findByIdAndDelete(savedReturn._id, {
                session: rollback,
              });
              await journalVoucherModel.deleteMany(
                { voucherNumber },
                { session: rollback },
              );
            });
          } finally {
            await rollback.endSession();
          }
          throw stockErr;
        } finally {
          await invSession.endSession();
        }
      } else {
        const session = await conn.startSession();
        try {
          await session.withTransaction(async () => {
            await runReturnAndJournal(session);
            await runDecreaseStock(session);
          });
        } finally {
          await session.endSession();
        }
      }

      return savedReturn;
    } catch (error: any) {
      console.error('PurchaseReturnService.create error:', error);
      if (error instanceof BadRequestException) throw error;
      if (error?.name === 'ValidationError')
        throw new BadRequestException(error.message);
      throw new InternalServerErrorException(
        error?.message || 'Failed to create purchase return',
      );
    }
  }

  async findAll() {
    const brand = this.getBrand();
    const purchaseReturnModel = this.getModel(brand);
    return purchaseReturnModel.find().exec();
  }

  async findOne(id: string) {
    const brand = this.getBrand();
    const purchaseReturnModel = this.getModel(brand);
    return purchaseReturnModel.findById(id).exec();
  }

  async update(id: string, updatePurchaseReturnDto: UpdatePurchaseReturnDto) {
    const brand = this.getBrand();
    const purchaseReturnModel = this.getModel(brand);
    return purchaseReturnModel
      .findByIdAndUpdate(id, updatePurchaseReturnDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    const brand = this.getBrand();
    const purchaseReturnModel = this.getModel(brand);
    return purchaseReturnModel.findByIdAndDelete(id).exec();
  }
}
