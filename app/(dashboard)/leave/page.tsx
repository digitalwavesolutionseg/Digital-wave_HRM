import {
  CalendarX,
  HeartPulse,
  Moon,
  Plane,
  Plus,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveTable } from "./leave-table";

interface LeaveBalance {
  type: string;
  available: number;
  used: number;
  total: number;
  icon: LucideIcon;
  tone: "primary" | "danger" | "info" | "muted" | "success" | "warning";
}

const balances: LeaveBalance[] = [
  { type: "Annual Vacation", available: 18, used: 6, total: 24, icon: Plane, tone: "primary" },
  { type: "Sick Leave", available: 12, used: 3, total: 15, icon: Stethoscope, tone: "danger" },
  { type: "Personal Leave", available: 6, used: 4, total: 10, icon: UserRound, tone: "info" },
  { type: "Unpaid Leave", available: 10, used: 0, total: 10, icon: CalendarX, tone: "muted" },
  { type: "Maternity Leave", available: 90, used: 0, total: 90, icon: HeartPulse, tone: "success" },
  { type: "Emergency Leave", available: 5, used: 1, total: 5, icon: Moon, tone: "warning" },
];

const accent: Record<LeaveBalance["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  muted: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const progress: Record<LeaveBalance["tone"], string> = {
  primary: "bg-primary",
  danger: "bg-destructive",
  info: "bg-info",
  muted: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
};

const summary = balances.slice(0, 4);

export default function LeavePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Leave Requests"
        description="Review requests and track remaining balances for every leave type."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New Request
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((balance) => {
          const Icon = balance.icon;
          return (
            <div
              key={balance.type}
              className="rounded-[20px] border border-border bg-card p-5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{balance.type}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${accent[balance.tone]}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">
                {balance.available}
                <span className="ml-1 text-sm font-medium text-muted-foreground"> days</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">available this year</p>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
          <CardDescription>Current utilization across all leave policies for 2026.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {balances.map((balance) => {
              const Icon = balance.icon;
              const pct = balance.total > 0 ? Math.round((balance.used / balance.total) * 100) : 0;
              return (
                <div
                  key={balance.type}
                  className="rounded-[16px] border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${accent[balance.tone]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{balance.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {balance.used} of {balance.total} days used
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{balance.available}</span>{" "}
                      remaining
                    </span>
                    <span className="tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${progress[balance.tone]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Requests</h2>
            <p className="text-sm text-muted-foreground">
              Manage and act on pending, approved, and rejected leave requests.
            </p>
          </div>
          <Badge variant="warning">3 pending</Badge>
        </div>
        <LeaveTable />
      </div>
    </div>
  );
}