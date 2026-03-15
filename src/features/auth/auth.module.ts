import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SeedService } from './services/seed.service';
import { AuthController } from './controllers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema, { UserEntity } from './entities/User.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getJwtSecret } from '../../config/runtime-config';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: UserEntity.name, schema: UserSchema }],
      'chemtronics',
    ),
    MongooseModule.forFeature(
      [{ name: UserEntity.name, schema: UserSchema }],
      'hydroworx',
    ),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: getJwtSecret(configService),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SeedService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
