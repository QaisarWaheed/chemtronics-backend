import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './controllers/audit-log.controller';

@Module({
  imports: [
    // All audit records are written to the admin/chemtronics connection.
    // Each document carries a 'brand' field to identify the tenant.
    MongooseModule.forFeature(
      [{ name: AuditLog.name, schema: AuditLogSchema }],
      'chemtronics',
    ),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
