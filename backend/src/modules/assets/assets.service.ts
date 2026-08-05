import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  findAll(query: any) {
    const category = query.category as string | undefined;
    const status = query.status as string | undefined;
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    return this.prisma.asset.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  create(dto: any) {
    return this.prisma.asset.create({
      data: {
        name: dto.name,
        category: dto.category,
        serialNumber: dto.serialNumber,
        condition: dto.condition,
        status: dto.status,
      },
    });
  }

  async update(id: string, dto: any) {
    await this.ensureExists(id);
    return this.prisma.asset.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        serialNumber: dto.serialNumber,
        condition: dto.condition,
        status: dto.status,
      },
    });
  }

  async assign(id: string, dto: any) {
    await this.ensureExists(id);
    return this.prisma.asset.update({
      where: { id },
      data: {
        assignedToId: dto.assignedToId ?? null,
        status: dto.assignedToId ? "ASSIGNED" : "AVAILABLE",
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.asset.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException("Asset not found");
    return asset;
  }
}
