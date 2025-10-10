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
    @InjectModel(Products.name, 'chemtronics') private readonly productModel: Model<Products>,
    @InjectModel(Products.name, 'hydroworx') private readonly productModel2: Model<Products>,
  ) {}


     private getModel(): Model<Products> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx' ? this.productModel2 : this.productModel;
  }




  async getAllProducts(): Promise<Products[] | null> {
    const productModel = this.getModel();
    return await productModel.find();
   
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
    const product = await productModel.findOne({
      name: data.productName,
    });
    if (!product) {
      return await productModel.create(data);
    }
    throw new BadRequestException('Product already exists');
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
