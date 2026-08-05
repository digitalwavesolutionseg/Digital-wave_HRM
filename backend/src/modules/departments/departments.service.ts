import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

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

  findAll() {
    return this.prisma.department.findMany({
      include: {
        manager: this.managerSelect,
        _count: {
          select: {
            employees: true,
            positions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        manager: this.managerSelect,
        employees: {
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
        },
        positions: true,
        _count: {
          select: {
            employees: true,
            positions: true,
          },
        },
      },
    });
  }

  create(dto: CreateDepartmentDto) {
    return this.prisma.department.create({ data: dto });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.ensureExists(id);
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.department.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException("Department not found");
    }
    return department;
  }
}
