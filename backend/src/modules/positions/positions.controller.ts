import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PositionsService } from "./positions.service";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("positions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("positions")
export class PositionsController {
  constructor(private positionsService: PositionsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findOne(@Param("id") id: string) {
    return this.positionsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR)
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Put(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  update(@Param("id") id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.positionsService.remove(id);
  }
}
