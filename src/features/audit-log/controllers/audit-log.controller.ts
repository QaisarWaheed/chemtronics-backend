import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuditLogService } from '../audit-log.service';
import type { AuditAction } from '../entities/audit-log.entity';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Roles('Super Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'module', required: false })
  @ApiQuery({
    name: 'action',
    required: false,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'ISO 8601' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ISO 8601' })
  @ApiQuery({ name: 'limit', required: false, description: 'Default 50' })
  @ApiQuery({ name: 'skip', required: false, description: 'Default 0' })
  async findAll(
    @Query('brand') brand?: string,
    @Query('module') module?: string,
    @Query('action') action?: AuditAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.auditLogService.findAll({
      brand,
      module,
      action,
      startDate,
      endDate,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }
}
