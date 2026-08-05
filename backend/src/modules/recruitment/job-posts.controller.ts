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
import { CreateJobPostDto } from "./dto/create-job-post.dto";
import { UpdateJobPostDto } from "./dto/update-job-post.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("recruitment-job-posts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("recruitment/job-posts")
export class JobPostsController {
  constructor(private recruitmentService: RecruitmentService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll(@Query() query: any) {
    return this.recruitmentService.findAllJobPosts(query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findOne(@Param("id") id: string) {
    return this.recruitmentService.findJobPost(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.RECRUITER)
  create(@Body() dto: CreateJobPostDto) {
    return this.recruitmentService.createJobPost(dto);
  }

  @Put(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.RECRUITER)
  update(@Param("id") id: string, @Body() dto: UpdateJobPostDto) {
    return this.recruitmentService.updateJobPost(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.recruitmentService.removeJobPost(id);
  }
}