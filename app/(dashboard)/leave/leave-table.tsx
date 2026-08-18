"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveRow {
  id: string;
  employee: string;
  employeeCode: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
}

const statusVariant: Record<LeaveStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

interface LeaveApiItem {
  id: string;
  employee: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
  leaveType: { name: string; color: string } | null;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

function mapLeave(item: LeaveApiItem): LeaveRow {
  const name = item.employee?.user
    ? `${item.employee.user.firstName} ${item.employee.user.lastName}`
    : "—";
  return {
    id: item.id,
    employee: name,
    employeeCode: item.employee?.employeeId ?? "—",
    type: item.leaveType?.name ?? "—",
    from: item.startDate,
    to: item.endDate,
    days: item.days,
    status: item.status,
  };
}

function makeColumns(
  canReview: boolean,
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  reviewingId: string | null
): ColumnDef<LeaveRow>[] {
  return [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.employee} size="sm" />
          <div>
            <p className="font-medium text-foreground">{row.original.employee}</p>
            <p className="text-xs text-muted-foreground">{row.original.employeeCode}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="info">{row.original.type}</Badge>,
    },
    {
      accessorKey: "from",
      header: "From",
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.from)}</span>,
    },
    {
      accessorKey: "to",
      header: "To",
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.to)}</span>,
    },
    {
      accessorKey: "days",
      header: "Days",
      cell: ({ row }) => (
        <Badge variant="outline" className="tabular-nums">
          {row.original.days} {row.original.days === 1 ? "day" : "days"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) =>
        canReview && row.original.status === "PENDING" ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="iconSm"
              className="text-success"
              aria-label="Approve"
              disabled={reviewingId === row.original.id}
              onClick={() => onApprove(row.original.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              className="text-destructive"
              aria-label="Reject"
              disabled={reviewingId === row.original.id}
              onClick={() => onReject(row.original.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];
}

const CAN_REVIEW_ROLES = new Set(["SUPER_ADMIN", "HR", "MANAGER"]);

interface LeaveTableProps {
  refreshKey?: number;
  onChanged?: () => void;
  onPendingCount?: (count: number) => void;
}

export function LeaveTable({ refreshKey, onChanged, onPendingCount }: LeaveTableProps) {
  const { user } = useAuth();
  const [rows, setRows] = React.useState<LeaveRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [reviewingId, setReviewingId] = React.useState<string | null>(null);

  const canReview = !!user && CAN_REVIEW_ROLES.has(user.role);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<LeaveApiItem[]>("/leave");
        if (cancelled) return;
        const mapped = res.map(mapLeave);
        setRows(mapped);
        onPendingCount?.(mapped.filter((r) => r.status === "PENDING").length);
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
  }, [refreshKey, onPendingCount]);

  const review = async (id: string, action: "approve" | "reject") => {
    setReviewingId(id);
    try {
      const { api } = await import("@/lib/api");
      await api.patch(`/leave/${id}/${action}`);
      toast.success(action === "approve" ? "Leave approved" : "Leave rejected");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${action} failed`);
    } finally {
      setReviewingId(null);
    }
  };

  const columns = React.useMemo(
    () =>
      makeColumns(
        canReview,
        (id) => void review(id, "approve"),
        (id) => void review(id, "reject"),
        reviewingId
      ),
    [canReview, reviewingId, onChanged]
  );

  if (loading) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load leave requests"
        description="Check that the backend API is reachable and you are signed in."
      />
    );
  }

  return <DataTable columns={columns} data={rows} />;
}
