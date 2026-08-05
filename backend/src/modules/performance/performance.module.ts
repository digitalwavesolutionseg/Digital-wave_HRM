import { Module } from "@nestjs/common";
import { PerformanceService } from "./performance.service";
import { GoalsController } from "./goals.controller";
import { ReviewsController } from "./reviews.controller";

@Module({
  controllers: [GoalsController, ReviewsController],
  providers: [PerformanceService],
})
export class PerformanceModule {}