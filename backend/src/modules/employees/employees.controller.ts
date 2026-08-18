import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("employees")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("employees")
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll(@Query() query: any) {
    return this.employeesService.findAll(query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.employeesService.findOne(id, user);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR)
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Put(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  update(@Param("id") id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN)
  remove(@Param("id") id: string) {
    return this.employeesService.remove(id);
  }
}
