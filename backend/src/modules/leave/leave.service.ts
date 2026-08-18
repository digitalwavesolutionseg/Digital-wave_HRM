import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { LeaveStatus } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { Role } from "../../common/decorators/roles.decorator";
import { AuditService } from "../audit/audit.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  private employeeSelect: any = {
    select: {
      id: true,
      employeeId: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  };

  findAll(query: any) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;
    return this.prisma.leave.findMany({
      where,
      include: {
        employee: this.employeeSelect,
        leaveType: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateLeaveDto, user?: any) {
    const employeeId = await this.resolveEmployeeId(dto.employeeId, user);
    if (!employeeId) {
      throw new ForbiddenException("No employee profile linked to your account");
    }
    const record = await this.prisma.leave.create({
      data: {
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        days: dto.days,
        reason: dto.reason,
      },
      include: { employee: true, leaveType: true },
    });

    await this.auditService.record({
      actorId: user?.id,
      action: "leave.create",
      entity: "leave",
      entityId: record.id,
      metadata: { employeeId, leaveTypeId: dto.leaveTypeId, days: dto.days },
    });

    return record;
  }

  async approve(id: string, user?: any) {
    await this.ensureExists(id);
    if (!user) {
      throw new ForbiddenException("Reviewer identity required");
    }
    const record = await this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.APPROVED,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      include: { employee: true, leaveType: true },
    });

    await this.auditService.record({
      actorId: user.id,
      action: "leave.approve",
      entity: "leave",
      entityId: id,
      metadata: { reviewerId: user.id },
    });

    return record;
  }

  async reject(id: string, user?: any) {
    await this.ensureExists(id);
    if (!user) {
      throw new ForbiddenException("Reviewer identity required");
    }
    const record = await this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      include: { employee: true, leaveType: true },
    });

    await this.auditService.record({
      actorId: user.id,
      action: "leave.reject",
      entity: "leave",
      entityId: id,
      metadata: { reviewerId: user.id },
    });

    return record;
  }

  async getBalance(employeeId: string, user?: any) {
    const resolvedEmployeeId = await this.resolveEmployeeId(employeeId, user);
    if (!resolvedEmployeeId) {
      throw new ForbiddenException("No employee profile linked to your account");
    }
    const leaveTypes = await this.prisma.leaveType.findMany({
      orderBy: { name: "asc" },
    });
    const leaves = await this.prisma.leave.findMany({
      where: { employeeId: resolvedEmployeeId, status: LeaveStatus.APPROVED },
    });
    return leaveTypes.map((leaveType) => {
      const taken = leaves
        .filter((leave) => leave.leaveTypeId === leaveType.id)
        .reduce((sum, leave) => sum + leave.days, 0);
      return {
        leaveTypeId: leaveType.id,
        name: leaveType.name,
        defaultDays: leaveType.defaultDays,
        taken,
        remaining: leaveType.defaultDays - taken,
      };
    });
  }

  private async resolveEmployeeId(
    requested: string | undefined,
    user?: any
  ): Promise<string | undefined> {
    if (user && user.role === Role.EMPLOYEE) {
      const employee = await this.prisma.employee.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      return employee?.id;
    }
    if (requested) return requested;
    if (user) {
      const employee = await this.prisma.employee.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      return employee?.id;
    }
    return undefined;
  }

  private async ensureExists(id: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) {
      throw new NotFoundException("Leave record not found");
    }
    return leave;
  }
}