import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../entities/User.entity';
import { CreateUserDto } from '../dto/CreateUserDto.dto';
import { UpdateUserDto } from '../dto/UpdateUserDto.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserEntity>,
  ) {}

  async getAllUsers(): Promise<UserEntity[] | null> {
    return await this.userModel.find();
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`no user found against this id: ${id}`);
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<UserEntity | null> {
    // const user = await this.userModel.findOne({data.email});
    // if(!user){
    // return await this.userModel.create(data);
    // }
    // throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);

    return await this.userModel.create(data);
  }

  async updateUser(
    id: string,
    data: Partial<UpdateUserDto>,
  ): Promise<UserEntity | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedUser;
  }

  async deleteUser(id: string): Promise<{ message: string } | null> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundException('no user found');
    }
    return { message: 'user Deleted Successfuly' };
  }
}
