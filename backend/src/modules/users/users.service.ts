import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Role } from "../../common/decorators/roles.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        employee: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto, actor?: any) {
    const target = await this.findOne(id);
    if (!target) throw new NotFoundException("User not found");

    if (dto.role && dto.role !== target.role) {
      if (!actor || actor.role !== Role.SUPER_ADMIN) {
        throw new ForbiddenException("Only a SUPER_ADMIN can change a user's role");
      }
      if (id === actor.id) {
        throw new ForbiddenException("You cannot change your own role");
      }
    }

    const data: Partial<UpdateUserDto> = { ...dto };
    if (data.role === undefined) delete data.role;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
      },
    });

    await this.auditService.record({
      actorId: actor?.id,
      action: "users.update",
      entity: "user",
      entityId: id,
      metadata: { changed: dto },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
