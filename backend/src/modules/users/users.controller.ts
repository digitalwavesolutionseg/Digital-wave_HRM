import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InviteUserDto } from "./dto/invite-user.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";
import { Throttle } from "@nestjs/throttler";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post("invite")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  invite(@CurrentUser() actor: any, @Body() dto: InviteUserDto) {
    return this.usersService.invite(actor, dto);
  }

  @Put(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  update(@Param("id") id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(id, dto, user);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN)
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}