import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  private userSelect: any = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
  };

  private managerSelect: any = {
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

  async findAll(query: any) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const search = query.search as string | undefined;
    const status = query.status as string | undefined;
    const departmentId = query.departmentId as string | undefined;

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: true,
          position: true,
          manager: this.managerSelect,
          user: { select: this.userSelect },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: this.managerSelect,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        leaves: true,
        attended: true,
        payrolls: true,
      },
    });
  }

  async create(dto: CreateEmployeeDto) {
    const data: any = { ...dto };
    data.joiningDate = new Date(dto.joiningDate);
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    if (dto.userId) {
      data.user = { connect: { id: dto.userId } };
      delete data.userId;
    }
    return this.prisma.employee.create({
      data,
      include: {
        department: true,
        position: true,
        user: { select: this.userSelect },
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.ensureExists(id);
    const data: any = { ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    if (dto.joiningDate) data.joiningDate = new Date(dto.joiningDate);
    if (dto.userId) {
      data.user = { connect: { id: dto.userId } };
      delete data.userId;
    }
    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        department: true,
        position: true,
        user: { select: this.userSelect },
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.employee.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }
    return employee;
  }
}