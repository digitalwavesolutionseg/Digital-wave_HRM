import { Injectable, NotFoundException } from "@nestjs/common";
import { EmployeeStatus, PayrollStatus } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { GeneratePayrollDto } from "./dto/generate-payroll.dto";

@Injectable()
export class PayrollService {
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
      department: { select: { id: true, name: true } },
    },
  };

  findAll(query: any) {
    const where: any = {};
    if (query.month) where.periodMonth = Number(query.month);
    if (query.year) where.periodYear = Number(query.year);
    if (query.status) where.status = query.status;
    return this.prisma.payroll.findMany({
      where,
      include: {
        employee: this.employeeSelect,
      },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    });
  }

  async generate(dto: GeneratePayrollDto) {
    const employees = await this.prisma.employee.findMany({
      where: { status: EmployeeStatus.ACTIVE },
    });

    const records: any[] = [];
    for (const employee of employees) {
      const grossSalary = Number(employee.salary);
      const record = await this.prisma.payroll.upsert({
        where: {
          employeeId_periodMonth_periodYear: {
            employeeId: employee.id,
            periodMonth: dto.month,
            periodYear: dto.year,
          },
        },
        update: {
          grossSalary,
          netPay: grossSalary,
          status: PayrollStatus.DRAFT,
        },
        create: {
          employeeId: employee.id,
          periodMonth: dto.month,
          periodYear: dto.year,
          grossSalary,
          netPay: grossSalary,
        },
      });
      records.push(record);
    }

    return { count: records.length, records };
  }

  async markPaid(id: string) {
    await this.ensureExists(id);
    return this.prisma.payroll.update({
      where: { id },
      data: { status: PayrollStatus.PAID, paidAt: new Date() },
      include: {
        employee: this.employeeSelect,
      },
    });
  }

  history(employeeId: string) {
    return this.prisma.payroll.findMany({
      where: { employeeId },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    });
  }

  private async ensureExists(id: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });
    if (!payroll) {
      throw new NotFoundException("Payroll record not found");
    }
    return payroll;
  }
}