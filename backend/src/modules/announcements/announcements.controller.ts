import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AnnouncementsService } from "./announcements.service";
import { CreateAnnouncementDto, UpdateAnnouncementDto } from "./dto/announcement.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("announcements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("announcements")
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.announcementsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  create(@Body() dto: CreateAnnouncementDto, @CurrentUser() user: any) {
    return this.announcementsService.create(dto, user.id);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  update(@Param("id") id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.announcementsService.remove(id);
  }
}