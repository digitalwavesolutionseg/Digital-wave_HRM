import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { LeaveService } from "./leave.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { ReviewLeaveDto } from "./dto/review-leave.dto";
import { QueryLeaveDto } from "./dto/query-leave.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("leave")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("leave")
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll(@Query() query: QueryLeaveDto) {
    return this.leaveService.findAll(query);
  }

  @Get("balance/:employeeId")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  getBalance(@Param("employeeId") employeeId: string) {
    return this.leaveService.getBalance(employeeId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE)
  create(@Body() dto: CreateLeaveDto) {
    return this.leaveService.create(dto);
  }

  @Patch(":id/approve")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  approve(@Param("id") id: string, @Body() dto?: ReviewLeaveDto) {
    return this.leaveService.approve(id, dto);
  }

  @Patch(":id/reject")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  reject(@Param("id") id: string, @Body() dto?: ReviewLeaveDto) {
    return this.leaveService.reject(id, dto);
  }
}