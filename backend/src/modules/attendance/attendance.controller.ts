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
import { AttendanceService } from "./attendance.service";
import { ClockInDto } from "./dto/clock-in.dto";
import { ClockOutDto } from "./dto/clock-out.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("attendance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll(@Query() query: any) {
    return this.attendanceService.findAll(query);
  }

  @Post("clock-in")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  clockIn(@Body() dto: ClockInDto, @CurrentUser() user: any) {
    return this.attendanceService.clockIn(dto, user);
  }

  @Post("clock-out")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  clockOut(@Body() dto: ClockOutDto, @CurrentUser() user: any) {
    return this.attendanceService.clockOut(dto, user);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  update(@Param("id") id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, dto);
  }
}