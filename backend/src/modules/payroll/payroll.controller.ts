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
import { PayrollService } from "./payroll.service";
import { GeneratePayrollDto } from "./dto/generate-payroll.dto";
import { QueryPayrollDto } from "./dto/query-payroll.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("payroll")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payroll")
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.FINANCE)
  findAll(@Query() query: QueryPayrollDto) {
    return this.payrollService.findAll(query);
  }

  @Get(":employeeId")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.FINANCE)
  history(@Param("employeeId") employeeId: string) {
    return this.payrollService.history(employeeId);
  }

  @Post("generate")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.FINANCE)
  generate(@Body() dto: GeneratePayrollDto) {
    return this.payrollService.generate(dto);
  }

  @Patch(":id/mark-paid")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.FINANCE)
  markPaid(@Param("id") id: string) {
    return this.payrollService.markPaid(id);
  }
}