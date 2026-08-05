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
import { RecruitmentService } from "./recruitment.service";
import { CreateInterviewDto } from "./dto/create-interview.dto";
import { UpdateInterviewDto } from "./dto/update-interview.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("recruitment-interviews")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("recruitment/interviews")
export class InterviewsController {
  constructor(private recruitmentService: RecruitmentService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll(@Query() query: any) {
    return this.recruitmentService.findAllInterviews(query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findOne(@Param("id") id: string) {
    return this.recruitmentService.findInterview(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.RECRUITER)
  create(@Body() dto: CreateInterviewDto) {
    return this.recruitmentService.createInterview(dto);
  }

  @Put(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.RECRUITER)
  update(@Param("id") id: string, @Body() dto: UpdateInterviewDto) {
    return this.recruitmentService.updateInterview(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.recruitmentService.removeInterview(id);
  }
}