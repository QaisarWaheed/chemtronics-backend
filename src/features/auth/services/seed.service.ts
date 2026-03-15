import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/User.entity';

const SUPER_ADMIN_USERNAME = 'superadmin';
const SUPER_ADMIN_PASSWORD = 'admin123';
const SUPER_ADMIN_ROLE = 'Super Admin';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(UserEntity.name, 'chemtronics')
    private readonly chemtronicsUserModel: Model<UserEntity>,
    @InjectModel(UserEntity.name, 'hydroworx')
    private readonly hydroworxUserModel: Model<UserEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin(): Promise<void> {
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    await this.upsertSuperAdmin(
      this.chemtronicsUserModel,
      'chemtronics',
      hashedPassword,
    );
    await this.upsertSuperAdmin(
      this.hydroworxUserModel,
      'hydroworx',
      hashedPassword,
    );
  }

  private async upsertSuperAdmin(
    model: Model<UserEntity>,
    brand: string,
    hashedPassword: string,
  ): Promise<void> {
    const existing = await model.findOne({ userName: SUPER_ADMIN_USERNAME });
    if (existing) {
      this.logger.log(
        `Super Admin already exists in [${brand}] — skipping seed.`,
      );
      return;
    }

    await model.create({
      userName: SUPER_ADMIN_USERNAME,
      fullName: 'Super Admin',
      password: hashedPassword,
      role: SUPER_ADMIN_ROLE,
    });

    this.logger.log(`Super Admin created in [${brand}] database.`);
  }
}
