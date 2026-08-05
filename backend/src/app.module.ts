import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { DepartmentsModule } from "./modules/departments/departments.module";
import { PositionsModule } from "./modules/positions/positions.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { LeaveModule } from "./modules/leave/leave.module";
import { PayrollModule } from "./modules/payroll/payroll.module";
import { RecruitmentModule } from "./modules/recruitment/recruitment.module";
import { PerformanceModule } from "./modules/performance/performance.module";
import { TrainingModule } from "./modules/training/training.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { AnnouncementsModule } from "./modules/announcements/announcements.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SettingsModule } from "./modules/settings/settings.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule,
    RecruitmentModule,
    PerformanceModule,
    TrainingModule,
    AssetsModule,
    AnnouncementsModule,
    ReportsModule,
    SettingsModule,
  ],
})
export class AppModule {}
