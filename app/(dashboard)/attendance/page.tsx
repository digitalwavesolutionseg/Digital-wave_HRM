"use client";

import * as React from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  AlarmClock,
  Clock,
  Timer,
  UserCheck,
  UserX,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { AttendanceTable } from "./attendance-table";
import { ClockDialog } from "./clock-dialog";
import { useAuth } from "@/components/auth-provider";

type DayStatus = "present" | "late" | "absent" | "leave";

interface AttendanceApiItem {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE";
  employee: { id: string; employeeId: string; user: { id: string } | null } | null;
}

const statusMeta: Record<DayStatus, { label: string; dot: string }> = {
  present: { label: "Present", dot: "bg-success" },
  late: { label: "Late", dot: "bg-warning" },
  absent: { label: "Absent", dot: "bg-destructive" },
  leave: { label: "Leave", dot: "bg-info" },
};

const apiStatusToDay: Record<string, DayStatus> = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  LEAVE: "leave",
};

function buildCalendar(today: Date) {
  const weekStartsOn = 0 as const;
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(today), { weekStartsOn }),
    end: endOfWeek(endOfMonth(today), { weekStartsOn }),
  });
  return days;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = React.useState<AttendanceApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [clockOpen, setClockOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<AttendanceApiItem[]>("/attendance");
        if (cancelled) return;
        setRecords(res);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const today = new Date();
  const days = buildCalendar(today);
  const monthStart = startOfMonth(today);

  const currentRecord = React.useMemo(() => {
    if (!user) return null;
    const todayKey = format(today, "yyyy-MM-dd");
    return (
      records.find(
        (r) =>
          format(new Date(r.date), "yyyy-MM-dd") === todayKey &&
          r.employee?.user?.id === user.id
      ) ?? null
    );
  }, [records, user, today]);

  const isClockedIn = !!currentRecord?.checkIn && !currentRecord?.checkOut;

  const counts: Record<DayStatus, number> = { present: 0, late: 0, absent: 0, leave: 0 };
  const statusByDate = new Map<string, DayStatus>();
  for (const record of records) {
    const dayStatus = apiStatusToDay[record.status];
    if (!dayStatus) continue;
    statusByDate.set(format(new Date(record.date), "yyyy-MM-dd"), dayStatus);
  }
  for (const day of days) {
    if (!isSameMonth(day, today) || isAfter(day, today)) continue;
    const status = statusByDate.get(format(day, "yyyy-MM-dd"));
    if (status) counts[status] += 1;
  }
  const presentToday = counts.present;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Attendance"
        description="Track check-ins, working hours, and daily presence across the team."
        actions={
          <Button variant={isClockedIn ? "outline" : "default"} onClick={() => setClockOpen(true)}>
            <Clock className="h-4 w-4" /> {isClockedIn ? "Clock Out" : "Clock In"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Present Today"
          value={`${presentToday}`}
          delta=""
          icon={<UserCheck className="h-5 w-5" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="On Time"
          value={String(counts.present)}
          delta=""
          icon={<AlarmClock className="h-5 w-5" />}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title="Late"
          value={String(counts.late)}
          delta=""
          icon={<Timer className="h-5 w-5" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Absent"
          value={String(counts.absent)}
          delta=""
          changeType="down"
          icon={<UserX className="h-5 w-5" />}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Monthly Attendance</CardTitle>
            <CardDescription>{format(monthStart, "MMMM yyyy")} overview by day</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {(Object.keys(statusMeta) as DayStatus[]).map((key) => {
              const dotCount = key === "present" ? presentToday : counts[key];
              return (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusMeta[key].dot}`} />
                  <span className="mr-1">{statusMeta[key].label}</span>
                  <span className="font-semibold text-foreground">{dotCount}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {days.map((day) => {
              const inMonth = isSameMonth(day, today);
              const dayNumber = Number(format(day, "d"));
              const isWeekend = getDay(day) === 0 || getDay(day) === 6;
              const isPast = !isAfter(day, today);
              const status = inMonth && isPast ? statusByDate.get(format(day, "yyyy-MM-dd")) : undefined;
              return (
                <div
                  key={day.toString()}
                  className={[
                    "flex flex-col items-center gap-2 rounded-[14px] border p-2 py-3 transition-colors",
                    inMonth
                      ? "border-border bg-card"
                      : "border-transparent bg-muted/30",
                    isToday(day) ? "ring-2 ring-primary/50" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-sm font-medium tabular-nums",
                      inMonth ? "text-foreground" : "text-muted-foreground/50",
                      isWeekend && inMonth ? "text-muted-foreground" : "",
                    ].join(" ")}
                  >
                    {dayNumber}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      status ? statusMeta[status].dot : "bg-transparent"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Attendance Log</h2>
            <p className="text-sm text-muted-foreground">
              Detailed daily check-in and check-out records.
            </p>
          </div>
        </div>
        {error && !loading ? (
          <div className="text-sm text-muted-foreground">
            Attendance data could not be loaded. Showing calendar from live records is unavailable.
          </div>
        ) : null}
        <AttendanceTable refreshKey={refreshKey} />
      </div>

      <ClockDialog
        open={clockOpen}
        onOpenChange={setClockOpen}
        currentRecord={currentRecord}
        onClocked={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
