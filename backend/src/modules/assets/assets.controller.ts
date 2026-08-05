import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AssetsService } from "./assets.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("assets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("assets")
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.assetsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  create(@Body() dto: any) {
    return this.assetsService.create(dto);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  update(@Param("id") id: string, @Body() dto: any) {
    return this.assetsService.update(id, dto);
  }

  @Patch(":id/assign")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  assign(@Param("id") id: string, @Body() dto: any) {
    return this.assetsService.assign(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.assetsService.remove(id);
  }
}