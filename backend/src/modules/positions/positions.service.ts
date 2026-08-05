import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.position.findMany({
      include: { department: true },
      orderBy: { title: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.position.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  create(dto: CreatePositionDto) {
    return this.prisma.position.create({ data: dto });
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.ensureExists(id);
    return this.prisma.position.update({
      where: { id },
      data: dto,
      include: { department: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.position.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const position = await this.prisma.position.findUnique({ where: { id } });
    if (!position) {
      throw new NotFoundException("Position not found");
    }
    return position;
  }
}
