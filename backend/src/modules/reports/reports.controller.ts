import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("reports")
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get("headcount")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  headcount() {
    return this.reportsService.headcount();
  }

  @Get("attendance")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  attendance(@Query() query: any) {
    return this.reportsService.attendance(query);
  }

  @Get("payroll")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.FINANCE)
  payroll(@Query() query: any) {
    return this.reportsService.payroll(query);
  }

  @Get("leave")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  leave(@Query() query: any) {
    return this.reportsService.leave(query);
  }
}