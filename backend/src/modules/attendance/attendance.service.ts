import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { AttendanceStatus } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { Role } from "../../common/decorators/roles.decorator";
import { AuditService } from "../audit/audit.service";
import { ClockInDto } from "./dto/clock-in.dto";
import { ClockOutDto } from "./dto/clock-out.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";

@Injectable()
export class AttendanceService {
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
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }
    return this.prisma.attendance.findMany({
      where,
      include: {
        employee: this.employeeSelect,
      },
      orderBy: { date: "desc" },
    });
  }

  async clockIn(dto: ClockInDto, user?: any) {
    const now = new Date();
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    const employeeId = await this.resolveEmployeeId(dto.employeeId, user);
    if (!employeeId) {
      throw new ForbiddenException("No employee profile linked to your account");
    }

    const record = await this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      update: { checkIn: now, checkOut: null },
      create: {
        employeeId,
        date,
        checkIn: now,
      },
      include: {
        employee: this.employeeSelect,
      },
    });

    await this.auditService.record({
      actorId: user?.id,
      action: "attendance.clock-in",
      entity: "attendance",
      entityId: record.id,
      metadata: { employeeId },
    });

    return record;
  }

  async clockOut(dto: ClockOutDto, user?: any) {
    const employeeId = await this.resolveEmployeeId(dto.employeeId, user);
    const attendance = dto.id
      ? await this.prisma.attendance.findUnique({
          where: { id: dto.id },
        })
      : employeeId
        ? await this.prisma.attendance.findFirst({
            where: { employeeId, checkIn: { not: null }, checkOut: null },
            orderBy: { date: "desc" },
          })
        : null;
    if (!attendance) {
      throw new NotFoundException("Attendance record not found");
    }
    if (employeeId && attendance.employeeId !== employeeId) {
      throw new ForbiddenException("You can only clock out from your own attendance");
    }
    if (!attendance.checkIn) {
      throw new BadRequestException("No check-in recorded for this attendance");
    }

    const checkOut = new Date();
    const checkIn = new Date(attendance.checkIn);
    const cutoff = new Date(checkIn);
    cutoff.setHours(9, 0, 0, 0);
    const status =
      checkIn.getTime() > cutoff.getTime()
        ? AttendanceStatus.LATE
        : AttendanceStatus.PRESENT;

    const workingHours = (checkOut.getTime() - checkIn.getTime()) / 3600000;
    const overtimeMinutes = Math.max(0, Math.floor((workingHours - 8) * 60));

    const updated = await this.prisma.attendance.update({
      where: { id: dto.id },
      data: { checkOut, status, overtimeMinutes },
      include: {
        employee: this.employeeSelect,
      },
    });

    await this.auditService.record({
      actorId: user?.id,
      action: "attendance.clock-out",
      entity: "attendance",
      entityId: updated.id,
      metadata: { employeeId: updated.employeeId, status },
    });

    return {
      ...updated,
      workingHours: Math.round(workingHours * 100) / 100,
    };
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    await this.ensureExists(id);
    const data: any = { ...dto };
    if (dto.checkIn) data.checkIn = new Date(dto.checkIn);
    if (dto.checkOut) data.checkOut = new Date(dto.checkOut);
    return this.prisma.attendance.update({
      where: { id },
      data,
      include: {
        employee: this.employeeSelect,
      },
    });
  }

  private async ensureExists(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException("Attendance record not found");
    }
    return attendance;
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
}