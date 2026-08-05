import { Injectable, NotFoundException } from "@nestjs/common";
import { LeaveStatus } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { ReviewLeaveDto } from "./dto/review-leave.dto";

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

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

  create(dto: CreateLeaveDto) {
    return this.prisma.leave.create({
      data: {
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        days: dto.days,
        reason: dto.reason,
      },
      include: { employee: true, leaveType: true },
    });
  }

  async approve(id: string, dto?: ReviewLeaveDto) {
    await this.ensureExists(id);
    return this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.APPROVED,
        reviewedById: dto?.reviewedById,
        reviewedAt: new Date(),
      },
      include: { employee: true, leaveType: true },
    });
  }

  async reject(id: string, dto?: ReviewLeaveDto) {
    await this.ensureExists(id);
    return this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        reviewedById: dto?.reviewedById,
        reviewedAt: new Date(),
      },
      include: { employee: true, leaveType: true },
    });
  }

  async getBalance(employeeId: string) {
    const leaveTypes = await this.prisma.leaveType.findMany({
      orderBy: { name: "asc" },
    });
    const leaves = await this.prisma.leave.findMany({
      where: { employeeId, status: LeaveStatus.APPROVED },
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

  private async ensureExists(id: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) {
      throw new NotFoundException("Leave record not found");
    }
    return leave;
  }
}