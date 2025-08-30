import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Products } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product-dto';
import { UpdateProductDto } from '../dto/update-productDto.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
  ) {}

  async getAllProducts(): Promise<Products[] | null> {
    return await this.productModel.find();
  }

  async getProductById(id: string): Promise<Products | null> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(data: CreateProductDto): Promise<Products | null> {
    const product = await this.productModel.findOne({
      name: data.productName,
    });
    if (!product) {
      return await this.productModel.create(data);
    }
    throw new BadRequestException('Product already exists');
  }

  async updateProduct(
    id: string,
    data: Partial<UpdateProductDto>,
  ): Promise<Products | null> {
    const product = await this.productModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!product) {
      throw new NotFoundException('Product Not Found');
    }
    return product;
  }

  async deleteProduct(id: string): Promise<{ message: string } | null> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      throw new NotFoundException('No product found');
    }
    return { message: 'Product Deleted Successfuly' };
  }
}
