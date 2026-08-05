import { Module } from "@nestjs/common";
import { RecruitmentService } from "./recruitment.service";
import { JobPostsController } from "./job-posts.controller";
import { CandidatesController } from "./candidates.controller";
import { InterviewsController } from "./interviews.controller";

@Module({
  controllers: [JobPostsController, CandidatesController, InterviewsController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}