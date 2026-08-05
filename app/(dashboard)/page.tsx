import {
  Users,
  UserPlus,
  Clock,
  CalendarClock,
  Wallet,
  Cake,
  Megaphone,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { UpcomingWidgets } from "@/components/dashboard/upcoming-widgets";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AnnouncementsList } from "@/components/dashboard/announcements-list";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening across Digital Wave."
        actions={<QuickActions />}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value="248"
          delta="+12"
          icon={<Users className="h-5 w-5" />}
          href="/employees"
        />
        <StatCard
          title="New This Month"
          value="14"
          delta="+18.2%"
          icon={<UserPlus className="h-5 w-5" />}
          iconClassName="bg-success/10 text-success"
          href="/employees"
        />
        <StatCard
          title="On Leave Today"
          value="9"
          delta="-2"
          changeType="down"
          icon={<CalendarClock className="h-5 w-5" />}
          iconClassName="bg-warning/10 text-warning"
          href="/leave"
        />
        <StatCard
          title="Monthly Payroll"
          value="$412,580"
          delta="+4.1%"
          icon={<Wallet className="h-5 w-5" />}
          iconClassName="bg-info/10 text-info"
          href="/payroll"
        />
      </div>

      {/* Charts row */}
      <DashboardCharts />

      {/* Secondary widgets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingWidgets />
        </div>
        <AnnouncementsList />
      </div>
    </div>
  );
}