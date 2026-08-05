import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.announcement.findMany({
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
  }

  findOne(id: string) {
    return this.prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async create(dto: any, authorId: string) {
    return this.prisma.announcement.create({
      data: {
        title: dto.title,
        body: dto.body,
        category: dto.category,
        pinned: dto.pinned ?? false,
        authorId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async update(id: string, dto: any) {
    await this.ensureExists(id);
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body,
        category: dto.category,
        pinned: dto.pinned,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.announcement.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new NotFoundException("Announcement not found");
    return announcement;
  }
}