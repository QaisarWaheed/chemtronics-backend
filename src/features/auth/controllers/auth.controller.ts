import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/CreateUserDto.dto';
import { UpdateUserDto } from '../dto/UpdateUserDto.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('allusers')
  async getAllUsers() {
    return await this.authService.getAllUsers();
  }

  @Get('/user-by-id/:id')
  async getUserById(@Param('id') id: string) {
    return await this.authService.getUserById(id);
  }

  @Post('/create-user')
  async creatUser(@Body() data: CreateUserDto) {
    return await this.authService.createUser(data);
  }

  @Put('/update-user-by-id/:id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.authService.updateUser(id, data);
  }

  @Delete('/delete-user-by-id/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.authService.deleteUser(id);
  }
}
