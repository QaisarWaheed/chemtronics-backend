import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../entities/User.entity';
import { CreateUserDto } from '../dto/CreateUserDto.dto';
import { UpdateUserDto } from '../dto/UpdateUserDto.dto';
import { REQUEST } from '@nestjs/core';

 


@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    @InjectModel(UserEntity.name, 'test') private readonly userModel: Model<UserEntity>,
    @InjectModel(UserEntity.name, 'hydroworx') private readonly userModel2: Model<UserEntity>,
  ) {}

  private getModel(): Model<UserEntity> {
    const brand = this.req['brand'] || 'test';
    return brand === 'hydroworx' ? this.userModel2 : this.userModel;
  }

  async getAllUsers(): Promise<UserEntity[] | null> {
    const userModel = this.getModel();
    return await userModel.find();
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    const userModel = this.getModel();
    const user = await userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`no user found against this id: ${id}`);
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<UserEntity | null> {
    const userModel = this.getModel();
    return await userModel.create(data);
  }


  async login(data: { userName: string; password: string }): Promise<{ user: UserEntity } | null> {
    const userModel = this.getModel();
    const { userName, password } = data;
    const user = await userModel.findOne({ userName, password });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return { user };
  }


  async updateUser(
    id: string,
    data: Partial<UpdateUserDto>,
  ): Promise<UserEntity | null> {
    const userModel = this.getModel();
    const updatedUser = await userModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedUser;
  }

  async deleteUser(id: string): Promise<{ message: string } | null> {
    const userModel = this.getModel();
    const deletedUser = await userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundException('no user found');
    }
    return { message: 'user Deleted Successfuly' };
  }
}
