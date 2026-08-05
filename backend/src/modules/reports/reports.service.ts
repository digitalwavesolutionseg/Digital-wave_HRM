import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async headcount() {
    const total = await this.prisma.employee.count({ where: { status: "ACTIVE" } });
    const byDepartment = await this.prisma.employee.groupBy({
      by: ["departmentId"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    });
    const departments = await this.prisma.department.findMany({
      select: { id: true, name: true },
    });
    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
    return {
      total,
      byDepartment: byDepartment.map((row) => ({
        department: departmentMap.get(row.departmentId) ?? row.departmentId,
        count: row._count._all,
      })),
    };
  }

  async attendance(query: any) {
    const month = query.month ? parseInt(query.month, 10) : new Date().getMonth() + 1;
    const year = query.year ? parseInt(query.year, 10) : new Date().getFullYear();
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 1);

    const records = await this.prisma.attendance.findMany({
      where: {
        date: { gte: from, lt: to },
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { date: "asc" },
    });

    const statusCounts: Record<string, number> = {};
    const totalHours = records.reduce((sum, r) => {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      if (r.checkIn && r.checkOut) {
        return sum + (r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    return {
      month,
      year,
      records,
      summary: {
        total: records.length,
        ...statusCounts,
        totalHours: Math.round(totalHours * 10) / 10,
      },
    };
  }

  async payroll(query: any) {
    const month = query.month ? parseInt(query.month, 10) : new Date().getMonth() + 1;
    const year = query.year ? parseInt(query.year, 10) : new Date().getFullYear();
    const rows = await this.prisma.payroll.findMany({
      where: { periodMonth: month, periodYear: year },
      include: {
        employee: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    const sum = (key: "grossSalary" | "allowances" | "bonuses" | "deductions" | "tax" | "netPay") =>
      rows.reduce((acc, r) => acc + Number(r[key]), 0);

    return {
      month,
      year,
      count: rows.length,
      rows,
      totals: {
        gross: sum("grossSalary"),
        allowances: sum("allowances"),
        bonuses: sum("bonuses"),
        deductions: sum("deductions"),
        tax: sum("tax"),
        net: sum("netPay"),
      },
    };
  }

  async leave(query: any) {
    const from = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), 0, 1);
    const to = query.to ? new Date(query.to) : new Date(new Date().getFullYear() + 1, 0, 1);

    const rows = await this.prisma.leave.findMany({
      where: {
        status: "APPROVED",
        startDate: { gte: from },
        endDate: { lt: to },
      },
      include: {
        leaveType: { select: { id: true, name: true, color: true } },
        employee: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    const byType: Record<string, number> = {};
    rows.forEach((r) => {
      byType[r.leaveType.name] = (byType[r.leaveType.name] ?? 0) + r.days;
    });

    return {
      from,
      to,
      count: rows.length,
      totalDays: rows.reduce((acc, r) => acc + r.days, 0),
      byType,
      rows,
    };
  }
}