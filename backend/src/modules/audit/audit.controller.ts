import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("audit")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("audit")
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR)
  findAll(
    @Query("entity") entity?: string,
    @Query("actorId") actorId?: string,
    @Query("limit") limit?: string
  ) {
    return this.auditService.findAll({ entity, actorId, limit: limit ? parseInt(limit, 10) : undefined });
  }
}