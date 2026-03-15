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
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @Inject(REQUEST) private readonly req: Request & { brand?: string },
    @InjectModel(UserEntity.name, 'chemtronics')
    private readonly userModel: Model<UserEntity>,
    @InjectModel(UserEntity.name, 'hydroworx')
    private readonly userModel2: Model<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  private getModel(): Model<UserEntity> {
    const brand = this.req['brand'] || 'chemtronics';
    return brand === 'hydroworx' ? this.userModel2 : this.userModel;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
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

  async createUser(data: CreateUserDto): Promise<UserEntity> {
    const userModel = this.getModel();
    const hashedPassword = await this.hashPassword(data.password);
    const userData = { ...data, password: hashedPassword };
    return await userModel.create(userData);
  }

  async login(data: {
    userName: string;
    password: string;
  }): Promise<{ access_token: string; user: UserEntity }> {
    const userModel = this.getModel();
    const { userName, password } = data;

    // Find user by userName only
    const user = await userModel.findOne({ userName });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Generate JWT token
    const brand = this.req['brand'] || 'chemtronics';
    const payload = {
      sub: user._id.toString(),
      userName: user.userName,
      brand,
      role: user.role ?? 'Staff',
    };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
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
