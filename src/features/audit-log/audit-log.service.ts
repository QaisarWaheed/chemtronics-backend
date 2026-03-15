import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditAction, AuditLog } from './entities/audit-log.entity';

export interface LogPayload {
  userId: string;
  userName: string;
  brand: string;
  action: AuditAction;
  module: string;
  description: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    // All audit records go to the 'chemtronics' connection —
    // the 'brand' field on each document records which tenant was affected.
    @InjectModel(AuditLog.name, 'chemtronics')
    private readonly auditLogModel: Model<AuditLog>,
  ) {}

  /**
   * Fire-and-forget: never throws — a logging failure must never
   * interrupt the caller's main business operation.
   */
  log(payload: LogPayload): void {
    this.auditLogModel
      .create({ ...payload, timestamp: new Date() })
      .catch((err: unknown) => {
        console.error('[AuditLog] Failed to write audit entry:', err);
      });
  }

  async findAll(filters: {
    brand?: string;
    module?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ total: number; data: AuditLog[] }> {
    const query: Record<string, unknown> = {};

    if (filters.brand) query['brand'] = filters.brand;
    if (filters.module) query['module'] = filters.module;
    if (filters.action) query['action'] = filters.action;

    if (filters.startDate || filters.endDate) {
      const tsFilter: Record<string, Date> = {};
      if (filters.startDate) {
        const d = new Date(filters.startDate);
        d.setHours(0, 0, 0, 0);
        tsFilter['$gte'] = d;
      }
      if (filters.endDate) {
        const d = new Date(filters.endDate);
        d.setHours(23, 59, 59, 999);
        tsFilter['$lte'] = d;
      }
      query['timestamp'] = tsFilter;
    }

    const limit = filters.limit ?? 50;
    const skip = filters.skip ?? 0;

    const [total, data] = await Promise.all([
      this.auditLogModel.countDocuments(query),
      this.auditLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
    ]);

    return { total, data };
  }
}
