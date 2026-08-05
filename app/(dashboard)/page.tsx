import { PageHeader } from "@/components/ui/page-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
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
      <DashboardStats />

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
