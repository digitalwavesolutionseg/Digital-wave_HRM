"use client";

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
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const headcountData = [
  { month: "Jan", hires: 12, exits: 4 },
  { month: "Feb", hires: 9, exits: 5 },
  { month: "Mar", hires: 14, exits: 3 },
  { month: "Apr", hires: 10, exits: 6 },
  { month: "May", hires: 8, exits: 7 },
  { month: "Jun", hires: 15, exits: 4 },
  { month: "Jul", hires: 11, exits: 5 },
  { month: "Aug", hires: 14, exits: 2 },
];

const deptData = [
  { name: "Engineering", value: 86, color: "#0B5FFF" },
  { name: "Sales", value: 52, color: "#F59E0B" },
  { name: "Marketing", value: 38, color: "#8B5CF6" },
  { name: "Operations", value: 34, color: "#22C55E" },
  { name: "Finance", value: 20, color: "#EF4444" },
  { name: "HR", value: 18, color: "#3B82F6" },
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export default function ReportsPage() {
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Headcount Movement</CardTitle>
            <CardDescription>Hires vs exits over the last 8 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headcountData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="hires" name="Hires" fill="#0B5FFF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="exits" name="Exits" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
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
            {[
              { label: "Active employees", value: "248", icon: <Users className="h-4 w-4" /> },
              { label: "Average tenure", value: "3.4 yrs", icon: <Clock className="h-4 w-4" /> },
              { label: "Quarterly turnover", value: "4.8%", icon: <TrendingDown className="h-4 w-4" /> },
              { label: "Open positions", value: "17", icon: <UserSearch className="h-4 w-4" /> },
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
      </div>

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