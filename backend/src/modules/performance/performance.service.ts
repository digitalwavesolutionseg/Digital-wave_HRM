import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { UpdateGoalDto } from "./dto/update-goal.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class PerformanceService {
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

  findAllGoals(query: any) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;
    return this.prisma.goal.findMany({
      where,
      include: {
        employee: this.employeeSelect,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findGoal(id: string) {
    return this.prisma.goal.findUnique({
      where: { id },
      include: {
        employee: this.employeeSelect,
      },
    });
  }

  createGoal(dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        employeeId: dto.employeeId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        progress: dto.progress,
        status: dto.status,
      },
      include: { employee: true },
    });
  }

  async updateGoal(id: string, dto: UpdateGoalDto) {
    await this.ensureGoal(id);
    return this.prisma.goal.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        progress: dto.progress,
        status: dto.status,
      },
      include: { employee: true },
    });
  }

  async removeGoal(id: string) {
    await this.ensureGoal(id);
    await this.prisma.goal.delete({ where: { id } });
    return { success: true };
  }

  findAllReviews(query: any) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.reviewerId) where.reviewerId = query.reviewerId;
    if (query.status) where.status = query.status;
    return this.prisma.performanceReview.findMany({
      where,
      include: {
        employee: this.employeeSelect,
        reviewer: this.employeeSelect,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findReview(id: string) {
    return this.prisma.performanceReview.findUnique({
      where: { id },
      include: {
        employee: this.employeeSelect,
        reviewer: this.employeeSelect,
      },
    });
  }

  createReview(dto: CreateReviewDto) {
    return this.prisma.performanceReview.create({
      data: {
        employeeId: dto.employeeId,
        reviewerId: dto.reviewerId,
        period: dto.period,
        rating: dto.rating,
        goals: dto.goals,
        feedback: dto.feedback,
        status: dto.status,
      },
      include: { employee: true, reviewer: true },
    });
  }

  async updateReview(id: string, dto: UpdateReviewDto) {
    await this.ensureReview(id);
    const data: any = {};
    if (dto.employeeId !== undefined) data.employeeId = dto.employeeId;
    if (dto.reviewerId !== undefined) data.reviewerId = dto.reviewerId;
    if (dto.period !== undefined) data.period = dto.period;
    if (dto.rating !== undefined) data.rating = dto.rating;
    if (dto.goals !== undefined) data.goals = dto.goals;
    if (dto.feedback !== undefined) data.feedback = dto.feedback;
    if (dto.status !== undefined) data.status = dto.status;
    return this.prisma.performanceReview.update({
      where: { id },
      data,
      include: { employee: true, reviewer: true },
    });
  }

  async removeReview(id: string) {
    await this.ensureReview(id);
    await this.prisma.performanceReview.delete({ where: { id } });
    return { success: true };
  }

  private async ensureGoal(id: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException("Goal not found");
    }
    return goal;
  }

  private async ensureReview(id: string) {
    const review = await this.prisma.performanceReview.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException("Performance review not found");
    }
    return review;
  }
}