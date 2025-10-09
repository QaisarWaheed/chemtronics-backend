import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product-dto';
import { UpdateProductDto } from '../dto/update-productDto.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAllProducts() {
    return await this.productsService.getAllProducts();
  }

  @Get('product-by-code/:code')
  async getProductByCode(@Param('code') code: number) {
    return await this.productsService.getProductByCode(code);
  }

  @Post('create-product')
  async createProduct(@Body() data: CreateProductDto) {
    return await this.productsService.createProduct(data);
  }

  @Put('update-product-by-id/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete('delete-product-by-id/:id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productsService.deleteProduct(id);
  }
}
