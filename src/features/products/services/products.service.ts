/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Products } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product-dto';
import { UpdateProductDto } from '../dto/update-productDto.dto';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class ProductsService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(Products.name, 'chemtronics')
    private readonly productModel: Model<Products>,
  ) {}

  // Shared inventory: always use the chemtronics collection regardless of brand
  private getModel(): Model<Products> {
    return this.productModel;
  }

  async getAllProducts(): Promise<Products[] | null> {
    const productModel = this.getModel();
    return await productModel.find();
  }

  async search(searchTerm?: string): Promise<Products[] | null> {
    const productModel = this.getModel();
    const query: any = {};

    // Case-insensitive multi-field search
    if (searchTerm && searchTerm.trim()) {
      query.$or = [
        { code: { $regex: searchTerm, $options: 'i' } },
        { productName: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    return await productModel.find(query);
  }

  async getProductByCode(code: number): Promise<Products | null> {
    const productModel = this.getModel();
    const product = await productModel.findOne({ code });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(data: CreateProductDto): Promise<Products | null> {
    const productModel = this.getModel();
    const existing = await productModel.findOne({ name: data.productName });
    if (existing) {
      throw new BadRequestException('Product already exists');
    }
    // Always mirror openingQuantity from quantity so the stock ledger
    // has a permanent baseline for this product.
    return await productModel.create({
      ...data,
      openingQuantity: data.quantity ?? 0,
    });
  }

  async updateProduct(
    id: string,
    data: Partial<UpdateProductDto>,
  ): Promise<Products | null> {
    const productModel = this.getModel();
    const product = await productModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!product) {
      throw new NotFoundException('Product Not Found');
    }
    return product;
  }

  async deleteProduct(id: string): Promise<{ message: string } | null> {
    const productModel = this.getModel();
    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      throw new NotFoundException('No product found');
    }
    return { message: 'Product Deleted Successfuly' };
  }
}
