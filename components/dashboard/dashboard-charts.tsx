"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface HeadcountResponse {
  total: number;
  byDepartment: { department: string; count: number }[];
}

interface AttendanceResponse {
  summary: { total: number; PRESENT?: number; ABSENT?: number; LATE?: number; totalHours: number };
}

interface PayrollResponse {
  count: number;
  totals: { gross: number; net: number; deductions: number; tax: number };
}

interface LeaveResponse {
  count: number;
  totalDays: number;
  byType: Record<string, number>;
}

const deptColors = ["#0B5FFF", "#F59E0B", "#8B5CF6", "#22C55E", "#EF4444", "#3B82F6"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export function DashboardCharts() {
  const [headcount, setHeadcount] = React.useState<HeadcountResponse | null>(null);
  const [attendance, setAttendance] = React.useState<AttendanceResponse | null>(null);
  const [payroll, setPayroll] = React.useState<PayrollResponse | null>(null);
  const [leave, setLeave] = React.useState<LeaveResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const [hc, att, pr, lv] = await Promise.all([
          api.get<HeadcountResponse>("/reports/headcount"),
          api.get<AttendanceResponse>("/reports/attendance"),
          api.get<PayrollResponse>(`/reports/payroll?month=${month}&year=${year}`),
          api.get<LeaveResponse>("/reports/leave"),
        ]);
        if (cancelled) return;
        setHeadcount(hc);
        setAttendance(att);
        setPayroll(pr);
        setLeave(lv);
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
  }, []);

  const departmentData = (headcount?.byDepartment ?? []).map((d, i) => ({
    name: d.department,
    value: d.count,
    color: deptColors[i % deptColors.length],
  }));

  const present = attendance?.summary.PRESENT ?? 0;
  const late = attendance?.summary.LATE ?? 0;
  const absent = attendance?.summary.ABSENT ?? 0;

  const genderData = [
    { name: "Present", value: present, color: "#22C55E" },
    { name: "Late", value: late, color: "#F59E0B" },
    { name: "Absent", value: absent, color: "#EF4444" },
  ];

  const leaveData = Object.entries(leave?.byType ?? {}).map(([name, value], i) => ({
    name,
    value,
    color: deptColors[i % deptColors.length],
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="h-[200px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load dashboard data"
        description="Check that the backend API is reachable and you are signed in."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Present vs late vs absent this month</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceBarData(present, late, absent)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="count" fill="#0B5FFF" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Headcount by Department</CardTitle>
          <CardDescription>Distribution across departments</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
              >
                {departmentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave by Type</CardTitle>
          <CardDescription>Days approved by leave type</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaveData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="value" name="Days" fill="#0B5FFF" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workforce</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] overflow-y-auto">
            <div className="space-y-3">
              {[
                { label: "Active employees", value: String(headcount?.total ?? 0), color: "#0B5FFF" },
                { label: "Attendance total", value: String(attendance?.summary.total ?? 0), color: "#22C55E" },
                { label: "Payroll employees", value: String(payroll?.count ?? 0), color: "#F59E0B" },
                { label: "Leave approvals", value: String(leave?.count ?? 0), color: "#EF4444" },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="flex-1 text-sm">{d.label}</span>
                  <span className="text-sm font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function attendanceBarData(present: number, late: number, absent: number) {
  return [
    { label: "Present", count: present },
    { label: "Late", count: late },
    { label: "Absent", count: absent },
  ];
}
