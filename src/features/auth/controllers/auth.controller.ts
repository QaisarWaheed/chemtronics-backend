import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/CreateUserDto.dto';
import { UpdateUserDto } from '../dto/UpdateUserDto.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('allusers')
  async getAllUsers() {
    return await this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/user-by-id/:id')
  async getUserById(@Param('id') id: string) {
    return await this.authService.getUserById(id);
  }

  @Post('/create-user')
  @Roles('Super Admin', 'Company Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async creatUser(@Body() data: CreateUserDto) {
    return await this.authService.createUser(data);
  }

  @Post('/login')
  async login(@Body() data: { userName: string; password: string }) {
    return await this.authService.login(data);
  }

  @Roles('Super Admin', 'Company Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Put('/update-user-by-id/:id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.authService.updateUser(id, data);
  }

  @Roles('Super Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Delete('/delete-user-by-id/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.authService.deleteUser(id);
  }
}
