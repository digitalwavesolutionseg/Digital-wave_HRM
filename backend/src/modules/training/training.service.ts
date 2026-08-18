import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Role } from "../../common/decorators/roles.decorator";
import {
  CreateTrainingProgramDto,
  UpdateTrainingProgramDto,
  EnrollTrainingDto,
  UpdateEnrollmentDto,
} from "./dto/training-program.dto";

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  findAll(query: any) {
    const category = query.category as string | undefined;
    const where: any = {};
    if (category) where.category = category;
    return this.prisma.trainingProgram.findMany({
      where,
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: string) {
    return this.prisma.trainingProgram.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            employee: {
              select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    });
  }

  create(dto: CreateTrainingProgramDto) {
    return this.prisma.trainingProgram.create({
      data: {
        title: dto.title,
        category: dto.category,
        instructor: dto.instructor,
        durationHours: dto.durationHours,
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateTrainingProgramDto) {
    await this.ensureExists(id);
    return this.prisma.trainingProgram.update({
      where: { id },
      data: {
        title: dto.title,
        category: dto.category,
        instructor: dto.instructor,
        durationHours: dto.durationHours,
        description: dto.description,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.trainingProgram.delete({ where: { id } });
    return { success: true };
  }

  async enroll(programId: string, dto: EnrollTrainingDto, user?: any) {
    let employeeId = dto.employeeId;
    if (user?.role === Role.EMPLOYEE || !employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { userId: user?.id },
        select: { id: true },
      });
      if (!employee) {
        throw new ForbiddenException("No employee profile linked to your account");
      }
      employeeId = employee.id;
    }
    return this.prisma.trainingEnrollment.create({
      data: {
        programId,
        employeeId,
      },
    });
  }

  async updateEnrollment(enrollmentId: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.prisma.trainingEnrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException("Enrollment not found");
    return this.prisma.trainingEnrollment.update({
      where: { id: enrollmentId },
      data: {
        completionRate: dto.completionRate,
        status: dto.status,
      },
    });
  }

  private async ensureExists(id: string) {
    const program = await this.prisma.trainingProgram.findUnique({ where: { id } });
    if (!program) throw new NotFoundException("Training program not found");
    return program;
  }
}
