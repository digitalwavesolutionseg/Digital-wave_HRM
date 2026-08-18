import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async record(params: {
    actorId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          metadata: (params.metadata as any) ?? undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log: ${String(error)}`);
    }
  }

  async findAll(query: { entity?: string; actorId?: string; limit?: number } = {}) {
    const where: any = {};
    if (query.entity) where.entity = query.entity;
    if (query.actorId) where.actorId = query.actorId;
    const take = query.limit ? Math.min(parseInt(String(query.limit), 10), 200) : 100;
    return this.prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    });
  }
}