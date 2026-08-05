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

const payrollTrend = [
  { month: "Jan", gross: 388400, net: 298600 },
  { month: "Feb", gross: 392700, net: 301800 },
  { month: "Mar", gross: 401200, net: 308900 },
  { month: "Apr", gross: 396800, net: 305400 },
  { month: "May", gross: 408600, net: 314200 },
  { month: "Jun", gross: 415300, net: 319500 },
  { month: "Jul", gross: 421900, net: 324800 },
  { month: "Aug", gross: 428450, net: 329080 },
];

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
  const [period, setPeriod] = React.useState("August 2026");
  const [runOpen, setRunOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<PayrollRun | null>(null);
  const [runs, setRuns] = React.useState<PayrollRun[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchRuns = React.useCallback(async (month: number, year: number) => {
    try {
      const { api } = await import("@/lib/api");
      const res = await api.get<PayrollApiItem[]>(`/payroll?month=${month}&year=${year}`);
      setRuns(res.map(mapPayroll));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    setPeriod(`${months[month - 1]} ${year}`);
    fetchRuns(month, year);
  }, [fetchRuns]);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPeriod(value);
    const parts = value.split(" ");
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(parts[0]) + 1;
    const year = Number(parts[1]);
    setLoading(true);
    fetchRuns(month, year);
  };

  const grossTotal = runs.reduce((acc, r) => acc + r.gross, 0);
  const netTotal = runs.reduce((acc, r) => acc + r.net, 0);
  const deductionsTotal = runs.reduce((acc, r) => acc + r.deductions, 0);

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
          <Button variant="ghost" size="sm" onClick={() => setSelected(row.original)}>
            <FileText className="h-4 w-4" />
            Payslip
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Payroll"
        description={`Manage payroll runs, payslips and compensation for ${period}.`}
        actions={
          <>
            <div className="w-40">
              <Select value={period} onChange={handlePeriodChange}>
                <option>{period}</option>
                <option>July 2026</option>
                <option>June 2026</option>
                <option>May 2026</option>
              </Select>
            </div>
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
            <CardDescription>Gross vs net payroll over the last 8 months</CardDescription>
          </div>
          <Badge variant="outline">YTD $3.2M</Badge>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={payrollTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payroll Runs</h2>
            <p className="text-sm text-muted-foreground">{period} · {runs.length} employee runs</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
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
          <DialogDescription>Review the run details before processing {period} payroll.</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payroll period</Label>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option>August 2026</option>
                <option>July 2026</option>
                <option>June 2026</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment date</Label>
              <div className="rounded-[14px] border border-input bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                Friday, August 28, 2026
              </div>
            </div>
            <div className="rounded-[14px] border border-border bg-accent/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">248 employees</span>
                <span className="text-sm font-semibold tabular-nums">$329,080.00</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Net amount to be disbursed across active runs.</p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRunOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setRunOpen(false)}>
            <Wallet className="h-4 w-4" />
            Run Payroll
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
              <Button>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
