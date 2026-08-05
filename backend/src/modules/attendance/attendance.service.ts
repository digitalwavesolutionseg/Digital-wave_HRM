import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { AttendanceStatus } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ClockInDto } from "./dto/clock-in.dto";
import { ClockOutDto } from "./dto/clock-out.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";

@Injectable()
export class AttendanceService {
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

  async clockIn(dto: ClockInDto) {
    const now = new Date();
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    return this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: dto.employeeId, date } },
      update: { checkIn: now },
      create: {
        employeeId: dto.employeeId,
        date,
        checkIn: now,
      },
      include: {
        employee: this.employeeSelect,
      },
    });
  }

  async clockOut(dto: ClockOutDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: dto.id },
    });
    if (!attendance) {
      throw new NotFoundException("Attendance record not found");
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
}