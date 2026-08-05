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
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("settings")
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(":key")
  findOne(@Param("key") key: string) {
    return this.settingsService.findOne(key);
  }

  @Put()
  @Roles(Role.SUPER_ADMIN, Role.HR)
  upsert(@Body() body: Record<string, any>) {
    return this.settingsService.upsert(body);
  }

  @Post(":key")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  set(@Param("key") key: string, @Body() body: any) {
    return this.settingsService.set(key, body.value);
  }

  @Delete(":key")
  @Roles(Role.SUPER_ADMIN)
  remove(@Param("key") key: string) {
    return this.settingsService.remove(key);
  }
}