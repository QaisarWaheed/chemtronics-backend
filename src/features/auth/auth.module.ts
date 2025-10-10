import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema, { UserEntity } from './entities/User.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }], 'test'),
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }], 'hydroworx'),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
