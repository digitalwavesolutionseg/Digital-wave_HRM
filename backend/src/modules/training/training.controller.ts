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
import { TrainingService } from "./training.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("training")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("training")
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.trainingService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.trainingService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  create(@Body() dto: any) {
    return this.trainingService.create(dto);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  update(@Param("id") id: string, @Body() dto: any) {
    return this.trainingService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.trainingService.remove(id);
  }

  @Post(":id/enroll")
  enroll(@Param("id") id: string, @Body() dto: any) {
    return this.trainingService.enroll(id, dto);
  }

  @Patch("enrollments/:enrollmentId")
  updateEnrollment(@Param("enrollmentId") enrollmentId: string, @Body() dto: any) {
    return this.trainingService.updateEnrollment(enrollmentId, dto);
  }
}
