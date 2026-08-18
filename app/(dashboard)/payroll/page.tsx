"use client";

import * as React from "react";
import {
  Banknote,
  Download,
  FileText,
  ReceiptText,
  Users,
  Wallet,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

type PayrollStatus = "PAID" | "PROCESSED" | "DRAFT";

interface PayrollRun {
  id: string;
  employee: string;
  role: string;
  gross: number;
  allowances: number;
  deductions: number;
  net: number;
  status: PayrollStatus;
}

interface PayrollApiItem {
  id: string;
  periodMonth: number;
  periodYear: number;
  grossSalary: number | string;
  allowances: number | string;
  bonuses: number | string;
  deductions: number | string;
  tax: number | string;
  netPay: number | string;
  status: PayrollStatus;
  employee: { employeeId: string; department: { name: string } | null; user: { firstName: string; lastName: string } | null } | null;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function mapPayroll(item: PayrollApiItem): PayrollRun {
  const name = item.employee?.user
    ? `${item.employee.user.firstName} ${item.employee.user.lastName}`
    : item.employee?.employeeId ?? "—";
  return {
    id: item.id,
    employee: name,
    role: item.employee?.department?.name ?? "—",
    gross: Number(item.grossSalary),
    allowances: Number(item.allowances) + Number(item.bonuses),
    deductions: Number(item.deductions) + Number(item.tax),
    net: Number(item.netPay),
    status: item.status,
  };
}

function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
  const map: Record<PayrollStatus, { label: string; variant: "success" | "warning" | "info" }> = {
    PAID: { label: "Paid", variant: "success" },
    PROCESSED: { label: "Processed", variant: "info" },
    DRAFT: { label: "Draft", variant: "warning" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function PayrollBreakdownRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={muted ? "text-sm text-muted-foreground" : "text-sm"}>{label}</span>
      <span className={`text-sm ${muted ? "text-muted-foreground" : "font-medium"}`}>{value}</span>
    </div>
  );
}

export default function PayrollPage() {
  const [period, setPeriod] = React.useState("");
  const [runOpen, setRunOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<PayrollRun | null>(null);
  const [runs, setRuns] = React.useState<PayrollRun[]>([]);
  const [chartData, setChartData] = React.useState<{ month: string; gross: number; net: number }[]>([]);
  const [periodOptions, setPeriodOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [runMonth, setRunMonth] = React.useState(() => new Date().getMonth() + 1);
  const [runYear, setRunYear] = React.useState(() => new Date().getFullYear());
  const [running, setRunning] = React.useState(false);
  const [markingId, setMarkingId] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    try {
      const { api } = await import("@/lib/api");
      const res = await api.get<PayrollApiItem[]>("/payroll");
      const sorted = [...res].sort((a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth);

      const byPeriod = new Map<string, PayrollApiItem[]>();
      for (const item of sorted) {
        const key = `${item.periodYear}-${String(item.periodMonth).padStart(2, "0")}`;
        const arr = byPeriod.get(key) ?? [];
        arr.push(item);
        byPeriod.set(key, arr);
      }
      const options = [...byPeriod.keys()]
        .map((key) => {
          const [y, m] = key.split("-").map(Number);
          return `${MONTHS[m - 1]} ${y}`;
        });
      setPeriodOptions(options);
      if (options.length > 0 && !options.includes(period)) {
        setPeriod(options[0]);
      }

      const byMonth = new Map<string, { gross: number; net: number }>();
      for (const item of sorted) {
        const key = `${MONTHS[item.periodMonth - 1]}`;
        const cur = byMonth.get(key) ?? { gross: 0, net: 0 };
        cur.gross += Number(item.grossSalary);
        cur.net += Number(item.netPay);
        byMonth.set(key, cur);
      }
      setChartData(
        [...byMonth.entries()].map(([month, totals]) => ({ month, ...totals })).slice(-8)
      );
      setError(false);
    } catch {
      setError(true);
    }
  }, [period]);

  const fetchRuns = React.useCallback(async (month: number, year: number) => {
    try {
      const { api } = await import("@/lib/api");
      const res = await api.get<PayrollApiItem[]>(`/payroll?month=${month}&year=${year}`);
      setRuns(res.map(mapPayroll));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchAll();
      if (cancelled) return;
      if (period) {
        const parts = period.split(" ");
        await fetchRuns(MONTHS.indexOf(parts[0]) + 1, Number(parts[1]));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [period, fetchAll, fetchRuns]);

  const handleRunPayroll = async () => {
    setRunning(true);
    try {
      const { api } = await import("@/lib/api");
      const res = await api.post<{ count: number }>("/payroll/generate", {
        month: runMonth,
        year: runYear,
      });
      toast.success(`Payroll generated for ${res.count} active employees`);
      setRunOpen(false);
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to run payroll");
    } finally {
      setRunning(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setMarkingId(id);
    try {
      const { api } = await import("@/lib/api");
      await api.patch(`/payroll/${id}/mark-paid`);
      toast.success("Payroll marked as paid");
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark as paid");
    } finally {
      setMarkingId(null);
    }
  };

  const handleExport = () => {
    const header = ["Employee", "Role", "Gross", "Allowances", "Deductions", "Net", "Status"];
    const lines = runs.map((r) =>
      [r.employee, r.role, r.gross, r.allowances, r.deductions, r.net, r.status].join(",")
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${period.replace(" ", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const grossTotal = runs.reduce((acc, r) => acc + r.gross, 0);
  const netTotal = runs.reduce((acc, r) => acc + r.net, 0);
  const deductionsTotal = runs.reduce((acc, r) => acc + r.deductions, 0);
  const ytdNet = chartData.reduce((acc, c) => acc + c.net, 0);

  const columns = React.useMemo<ColumnDef<PayrollRun>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.employee} size="sm" />
            <div>
              <p className="font-medium text-foreground">{row.original.employee}</p>
              <p className="text-xs text-muted-foreground">{row.original.role}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "gross",
        header: "Gross",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.gross)}</span>,
      },
      {
        accessorKey: "allowances",
        header: "Allowances",
        cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{formatCurrency(row.original.allowances)}</span>,
      },
      {
        accessorKey: "deductions",
        header: "Deductions",
        cell: ({ row }) => (
          <span className="tabular-nums text-destructive">-{formatCurrency(row.original.deductions)}</span>
        ),
      },
      {
        accessorKey: "net",
        header: "Net Pay",
        cell: ({ row }) => <span className="font-semibold tabular-nums">{formatCurrency(row.original.net)}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <PayrollStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {row.original.status !== "PAID" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-success"
                disabled={markingId === row.original.id}
                onClick={() => handleMarkPaid(row.original.id)}
              >
                {markingId === row.original.id ? "Marking..." : "Mark Paid"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelected(row.original)}>
              <FileText className="h-4 w-4" />
              Payslip
            </Button>
          </div>
        ),
      },
    ],
    [markingId]
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Payroll"
        description={`Manage payroll runs, payslips and compensation${period ? ` for ${period}.` : "."}`}
        actions={
          <>
            {periodOptions.length > 0 && (
              <div className="w-44">
                <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                  {periodOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <Button onClick={() => setRunOpen(true)}>
              <Wallet className="h-4 w-4" />
              Run Payroll
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Monthly Gross"
          value={formatCurrency(grossTotal)}
          delta=""
          icon={<Wallet className="h-5 w-5" />}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title="Net Payroll"
          value={formatCurrency(netTotal)}
          delta=""
          icon={<Banknote className="h-5 w-5" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Deductions"
          value={formatCurrency(deductionsTotal)}
          delta=""
          icon={<ReceiptText className="h-5 w-5" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Employees Paid"
          value={String(runs.length)}
          delta=""
          icon={<Users className="h-5 w-5" />}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Payroll Cost</CardTitle>
            <CardDescription>Gross vs net payroll across recorded periods</CardDescription>
          </div>
          <Badge variant="outline">Net YTD {formatCurrency(ytdNet)}</Badge>
        </CardHeader>
        <CardContent className="h-[280px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B5FFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0B5FFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gross"
                  name="Gross"
                  stroke="#0B5FFF"
                  strokeWidth={2.5}
                  fill="url(#grossFill)"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#netFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No payroll data yet"
              description="Run payroll for a period to start tracking costs."
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payroll Runs</h2>
            <p className="text-sm text-muted-foreground">
              {period ? `${period} · ${runs.length} employee runs` : "Loading..."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={runs.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load payroll runs"
            description="Check that the backend API is reachable and you are signed in."
          />
        ) : (
          <DataTable columns={columns} data={runs} pagination />
        )}
      </div>

      <Dialog open={runOpen} onOpenChange={setRunOpen}>
        <DialogHeader>
          <DialogTitle>Run Payroll</DialogTitle>
          <DialogDescription>Generate payroll drafts for all active employees in a period.</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="run-month">Month</Label>
                <Select id="run-month" value={runMonth} onChange={(e) => setRunMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="run-year">Year</Label>
                <Select id="run-year" value={runYear} onChange={(e) => setRunYear(Number(e.target.value))}>
                  {[new Date().getFullYear(), new Date().getFullYear() - 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="rounded-[14px] border border-border bg-accent/40 p-4 text-sm">
              <p className="text-muted-foreground">
                Running payroll creates or refreshes DRAFT records for every active employee in{" "}
                <span className="font-medium text-foreground">{MONTHS[runMonth - 1]} {runYear}</span>. Existing runs
                for the period are updated; you can mark them paid afterward.
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRunOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRunPayroll} disabled={running}>
            <Wallet className="h-4 w-4" />
            {running ? "Running..." : "Run Payroll"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>Payslip</DialogTitle>
              <DialogDescription>
                {selected.employee} · {selected.role} · {period}
              </DialogDescription>
            </DialogHeader>
            <DialogContent>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Earnings</p>
                <PayrollBreakdownRow label="Basic salary" value={formatCurrency(selected.gross)} />
                <PayrollBreakdownRow label="Allowances" value={formatCurrency(selected.allowances)} />
                <PayrollBreakdownRow label="Gross pay" value={formatCurrency(selected.gross + selected.allowances)} muted />
              </div>
              <div className="space-y-1 border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deductions</p>
                <PayrollBreakdownRow label="Tax & social security" value={formatCurrency(selected.deductions)} />
                <div className="flex items-center justify-between border-t border-border py-2">
                  <span className="text-sm font-semibold">Net pay</span>
                  <span className="text-base font-bold tabular-nums text-success">{formatCurrency(selected.net)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[14px] border border-border bg-muted/40 px-3 py-2.5">
                <Badge variant="success">{selected.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  Payslip {selected.id} · Generated by Digital Wave HRM
                </span>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}