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
import {
  CreateTrainingProgramDto,
  UpdateTrainingProgramDto,
  EnrollTrainingDto,
  UpdateEnrollmentDto,
} from "./dto/training-program.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
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
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll(@Query() query: any) {
    return this.trainingService.findAll(query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findOne(@Param("id") id: string) {
    return this.trainingService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  create(@Body() dto: CreateTrainingProgramDto) {
    return this.trainingService.create(dto);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  update(@Param("id") id: string, @Body() dto: UpdateTrainingProgramDto) {
    return this.trainingService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.trainingService.remove(id);
  }

  @Post(":id/enroll")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE)
  enroll(@Param("id") id: string, @Body() dto: EnrollTrainingDto, @CurrentUser() user: any) {
    return this.trainingService.enroll(id, dto, user);
  }

  @Patch("enrollments/:enrollmentId")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER)
  updateEnrollment(@Param("enrollmentId") enrollmentId: string, @Body() dto: UpdateEnrollmentDto) {
    return this.trainingService.updateEnrollment(enrollmentId, dto);
  }
}
