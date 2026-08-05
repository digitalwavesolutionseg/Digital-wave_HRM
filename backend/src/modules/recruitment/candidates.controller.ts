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
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";

@ApiTags("recruitment-candidates")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("recruitment/candidates")
export class CandidatesController {
  constructor(private recruitmentService: RecruitmentService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findAll(@Query() query: any) {
    return this.recruitmentService.findAllCandidates(query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.MANAGER, Role.FINANCE, Role.RECRUITER, Role.EMPLOYEE)
  findOne(@Param("id") id: string) {
    return this.recruitmentService.findCandidate(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.RECRUITER)
  create(@Body() dto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(dto);
  }

  @Put(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR, Role.RECRUITER)
  update(@Param("id") id: string, @Body() dto: UpdateCandidateDto) {
    return this.recruitmentService.updateCandidate(id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.recruitmentService.removeCandidate(id);
  }
}