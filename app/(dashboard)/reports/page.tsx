"use client";

"use client";

import * as React from "react";
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Download,
  Users,
  CalendarClock,
  Wallet,
  Plane,
  UserSearch,
  TrendingDown,
  BarChart3,
  PieChart,
  Clock,
  UserX,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

type ReportType = "PDF" | "EXCEL" | "CSV";

type Report = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: ReportType;
  updated: string;
};

const reportTypeVariant: Record<ReportType, "default" | "success" | "warning"> = {
  PDF: "default",
  EXCEL: "success",
  CSV: "warning",
};

const reports: Report[] = [
  {
    id: "1",
    name: "Headcount Report",
    description: "Active headcount by department, location and employment type with month-over-month change.",
    icon: <Users className="h-5 w-5" />,
    type: "PDF",
    updated: "Aug 1, 2026",
  },
  {
    id: "2",
    name: "Attendance Report",
    description: "Daily attendance, late arrivals and early departures across all teams for any date range.",
    icon: <CalendarClock className="h-5 w-5" />,
    type: "EXCEL",
    updated: "Aug 3, 2026",
  },
  {
    id: "3",
    name: "Payroll Report",
    description: "Gross pay, deductions, net pay and employer costs summarized by employee and department.",
    icon: <Wallet className="h-5 w-5" />,
    type: "CSV",
    updated: "Jul 31, 2026",
  },
  {
    id: "4",
    name: "Leave Report",
    description: "Leave balances, approvals and utilization trends broken down by leave type and employee.",
    icon: <Plane className="h-5 w-5" />,
    type: "PDF",
    updated: "Aug 2, 2026",
  },
  {
    id: "5",
    name: "Recruitment Report",
    description: "Hiring funnel metrics including applications, interviews, offers and time-to-hire.",
    icon: <UserSearch className="h-5 w-5" />,
    type: "EXCEL",
    updated: "Jul 28, 2026",
  },
  {
    id: "6",
    name: "Turnover Report",
    description: "Voluntary and involuntary turnover rates with retention analysis by tenure and team.",
    icon: <TrendingDown className="h-5 w-5" />,
    type: "PDF",
    updated: "Jul 29, 2026",
  },
];

const typeIcon: Record<ReportType, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4" />,
  EXCEL: <FileSpreadsheet className="h-4 w-4" />,
  CSV: <FileDown className="h-4 w-4" />,
};

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

export default function ReportsPage() {
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
        const [hc, att, pr, lv] = await Promise.all([
          api.get<HeadcountResponse>("/reports/headcount"),
          api.get<AttendanceResponse>("/reports/attendance"),
          api.get<PayrollResponse>("/reports/payroll"),
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

  const deptData = (headcount?.byDepartment ?? []).map((d, i) => ({
    name: d.department,
    value: d.count,
    color: deptColors[i % deptColors.length],
  }));

  const snapshotRows = [
    { label: "Active employees", value: String(headcount?.total ?? 0), icon: <Users className="h-4 w-4" /> },
    { label: "Present today", value: String(attendance?.summary?.PRESENT ?? 0), icon: <CalendarClock className="h-4 w-4" /> },
    { label: "Late arrivals", value: String(attendance?.summary?.LATE ?? 0), icon: <Clock className="h-4 w-4" /> },
    { label: "Absent", value: String(attendance?.summary?.ABSENT ?? 0), icon: <UserX className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Reports & Analytics"
        description="Generate insights from your workforce data."
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="h-[300px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Unable to load report data"
          description="Check that the backend API is reachable and you are signed in."
        />
      ) : (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
            <CardDescription>Current month gross, deductions and net payroll</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Gross payroll", value: formatCurrency(payroll?.totals.gross), icon: <Wallet className="h-4 w-4" /> },
              { label: "Deductions & tax", value: formatCurrency((payroll?.totals.deductions ?? 0) + (payroll?.totals.tax ?? 0)), icon: <TrendingDown className="h-4 w-4" /> },
              { label: "Net payroll", value: formatCurrency(payroll?.totals.net), icon: <Plane className="h-4 w-4" /> },
              { label: "Employees on payroll", value: String(payroll?.count ?? 0), icon: <Users className="h-4 w-4" /> },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 rounded-[14px] border border-border px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary/8 text-primary">
                  {row.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="text-base font-semibold">{row.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Headcount by Department</CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={deptData}
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deptData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workforce Snapshot</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshotRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 rounded-[14px] border border-border px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary/8 text-primary">
                  {row.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="text-base font-semibold">{row.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      )}

      <div>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Available Reports</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <Card key={r.id} className="group flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary/8 text-primary">
                    {r.icon}
                  </div>
                  <Badge variant={reportTypeVariant[r.type]}>
                    {typeIcon[r.type]}
                    {r.type}
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold">{r.name}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {r.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">Updated {r.updated}</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-warning/10 text-warning">
            <PieChart className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">Custom Reports</h3>
            <p className="text-sm text-muted-foreground">
              Build your own report by combining metrics, dimensions and filters, then schedule it for
              automatic delivery.
            </p>
          </div>
          <Button className="shrink-0">Create Custom Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}