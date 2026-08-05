"use client";

import * as React from "react";
import { Cake, CalendarClock, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface LeaveApiItem {
  id: string;
  status: string;
  employee: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
  startDate: string;
  endDate: string;
}

interface EmployeeApiItem {
  id: string;
  employeeId: string;
  birthDate: string | null;
  joiningDate: string;
  department: { name: string } | null;
  position: { title: string } | null;
  user: { firstName: string; lastName: string } | null;
}

function personName(p: { employeeId: string; user: { firstName: string; lastName: string } | null } | null) {
  return p?.user ? `${p.user.firstName} ${p.user.lastName}` : p?.employeeId ?? "—";
}

export function UpcomingWidgets() {
  const [onLeave, setOnLeave] = React.useState<LeaveApiItem[]>([]);
  const [newHires, setNewHires] = React.useState<EmployeeApiItem[]>([]);
  const [birthdays, setBirthdays] = React.useState<EmployeeApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const [leaveRes, employeesRes] = await Promise.all([
          api.get<LeaveApiItem[]>("/leave"),
          api.get<{ data: EmployeeApiItem[] }>("/employees?limit=100"),
        ]);
        if (cancelled) return;
        const employees = employeesRes.data ?? [];

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const approvedToday = leaveRes.filter(
          (l) =>
            l.status === "APPROVED" &&
            l.startDate.slice(0, 10) <= todayStr &&
            l.endDate.slice(0, 10) >= todayStr
        );
        setOnLeave(approvedToday);

        const sorted = [...employees].sort(
          (a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()
        );
        setNewHires(sorted.slice(0, 3));

        const monthDay = today.toISOString().slice(5, 10);
        setBirthdays(
          employees.filter(
            (e) => e.birthDate && e.birthDate.slice(5, 10) === monthDay
          ).slice(0, 3)
        );
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cake className="h-4 w-4 text-primary" /> Birthdays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {birthdays.length === 0 ? (
            <p className="text-sm text-muted-foreground">No birthdays today.</p>
          ) : (
            birthdays.map((b) => {
              const name = personName(b.user ? { employeeId: b.employeeId, user: b.user } : null);
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <Avatar name={name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.department?.name ?? "—"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-warning" /> On Leave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {onLeave.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one on leave today.</p>
          ) : (
            onLeave.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <Avatar name={personName(l.employee)} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{personName(l.employee)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(l.startDate)} – {formatDate(l.endDate)}
                  </p>
                </div>
                <Badge variant="warning">Leave</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4 text-success" /> New Hires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {newHires.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent hires.</p>
          ) : (
            newHires.map((h) => {
              const name = personName(h.user ? { employeeId: h.employeeId, user: h.user } : null);
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <Avatar name={name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.position?.title ?? "—"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(h.joiningDate)}</span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
