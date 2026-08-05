"use client";

import * as React from "react";
import { Users, UserPlus, CalendarClock, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface HeadcountResponse {
  total: number;
  byDepartment: { department: string; count: number }[];
}

interface PayrollResponse {
  count: number;
  totals: { gross: number; net: number; deductions: number; tax: number };
}

interface EmployeeApiItem {
  id: string;
  joiningDate: string;
}

interface LeaveApiItem {
  startDate: string;
  endDate: string;
  status: string;
}

export function DashboardStats() {
  const [total, setTotal] = React.useState<number | null>(null);
  const [newThisMonth, setNewThisMonth] = React.useState<number | null>(null);
  const [onLeave, setOnLeave] = React.useState<number | null>(null);
  const [payrollNet, setPayrollNet] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const [hc, payrollRes, employeesRes, leaveRes] = await Promise.all([
          api.get<HeadcountResponse>("/reports/headcount"),
          api.get<PayrollResponse>(`/reports/payroll?month=${month}&year=${year}`),
          api.get<{ data: EmployeeApiItem[] }>("/employees?limit=100"),
          api.get<LeaveApiItem[]>("/leave"),
        ]);
        if (cancelled) return;
        setTotal(hc.total);
        setPayrollNet(payrollRes.totals.net);
        const employees = employeesRes.data ?? [];
        const startOfMonth = new Date(year, month - 1, 1).getTime();
        setNewThisMonth(
          employees.filter((e) => new Date(e.joiningDate).getTime() >= startOfMonth).length
        );
        const todayStr = `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        setOnLeave(
          leaveRes.filter(
            (l) =>
              l.status === "APPROVED" &&
              l.startDate.slice(0, 10) <= todayStr &&
              l.endDate.slice(0, 10) >= todayStr
          ).length
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[20px] border border-border bg-card p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Employees"
        value={String(total ?? "—")}
        icon={<Users className="h-5 w-5" />}
        href="/employees"
      />
      <StatCard
        title="New This Month"
        value={String(newThisMonth ?? "—")}
        icon={<UserPlus className="h-5 w-5" />}
        iconClassName="bg-success/10 text-success"
        href="/employees"
      />
      <StatCard
        title="On Leave Today"
        value={String(onLeave ?? "—")}
        icon={<CalendarClock className="h-5 w-5" />}
        iconClassName="bg-warning/10 text-warning"
        href="/leave"
      />
      <StatCard
        title="Monthly Payroll"
        value={payrollNet !== null ? formatCurrency(payrollNet) : "—"}
        icon={<Wallet className="h-5 w-5" />}
        iconClassName="bg-info/10 text-info"
        href="/payroll"
      />
    </div>
  );
}
