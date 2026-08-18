"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaveTable } from "./leave-table";
import { LeaveFormDialog } from "./leave-form-dialog";
import { useAuth } from "@/components/auth-provider";

interface BalanceItem {
  leaveTypeId: string;
  name: string;
  defaultDays: number;
  taken: number;
  remaining: number;
}

export default function LeavePage() {
  const { user } = useAuth();
  const [balances, setBalances] = React.useState<BalanceItem[]>([]);
  const [balancesLoading, setBalancesLoading] = React.useState(true);
  const [balancesError, setBalancesError] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setBalancesLoading(true);
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        let empId: string | null = null;
        if (user.role !== "EMPLOYEE") {
          const res = await api.get<
            { data: { id: string; user: { id: string } | null }[] }
          >("/employees?limit=100");
          empId = res.data.find((e) => e.user?.id === user.id)?.id ?? null;
        }
        if (cancelled) return;
        setEmployeeId(empId);
        if (!empId) {
          setBalances([]);
          setBalancesLoading(false);
          return;
        }
        const res = await api.get<BalanceItem[]>(`/leave/balance/${empId}`);
        if (cancelled) return;
        setBalances(res);
        setBalancesError(false);
      } catch {
        if (!cancelled) setBalancesError(true);
      } finally {
        if (!cancelled) setBalancesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Leave Requests"
        description="Review requests and track remaining balances for every leave type."
        actions={
          <Button onClick={() => setDialogOpen(true)} disabled={!employeeId}>
            <Plus className="h-4 w-4" /> New Request
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Your Leave Balances</CardTitle>
          <CardDescription>Current utilization across all leave policies for this year.</CardDescription>
        </CardHeader>
        <CardContent>
          {balancesLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-[16px]" />
              ))}
            </div>
          ) : balancesError ? (
            <EmptyState
              title="Unable to load balances"
              description="Check that the backend API is reachable and you are signed in."
            />
          ) : balances.length === 0 ? (
            <EmptyState
              title="No balances available"
              description="No employee profile is linked to your account, or no leave types are configured."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {balances.map((balance) => {
                const total = balance.defaultDays;
                const pct = total > 0 ? Math.round((balance.taken / total) * 100) : 0;
                return (
                  <div
                    key={balance.leaveTypeId}
                    className="rounded-[16px] border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{balance.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {balance.taken} of {total} days used
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{balance.remaining}</span>{" "}
                        remaining
                      </span>
                      <span className="tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          <Badge variant="warning">
            {pendingCount} {pendingCount === 1 ? "pending" : "pending"}
          </Badge>
        </div>
        <LeaveTable
          refreshKey={refreshKey}
          onChanged={() => setRefreshKey((k) => k + 1)}
          onPendingCount={setPendingCount}
        />
      </div>

      <LeaveFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employeeId={employeeId}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}