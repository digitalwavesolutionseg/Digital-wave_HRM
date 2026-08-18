"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "LEAVE";

interface AttendanceRow {
  id: string;
  employee: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: AttendanceStatus;
}

interface AttendanceApiItem {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  employee: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
}

const statusVariant: Record<AttendanceStatus, "success" | "warning" | "danger" | "info"> = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "danger",
  LEAVE: "info",
};

function formatTime(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapAttendance(item: AttendanceApiItem): AttendanceRow {
  const name = item.employee?.user
    ? `${item.employee.user.firstName} ${item.employee.user.lastName}`
    : item.employee?.employeeId ?? "—";
  let hours = "0h";
  if (item.checkIn && item.checkOut) {
    const diff = (new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / (1000 * 60 * 60);
    hours = `${Math.floor(diff)}h ${Math.round((diff % 1) * 60)}m`;
  }
  return {
    id: item.id,
    employee: name,
    department: "—",
    date: item.date,
    checkIn: formatTime(item.checkIn),
    checkOut: formatTime(item.checkOut),
    hours,
    status: item.status,
  };
}

const columns: ColumnDef<AttendanceRow>[] = [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.employee} size="sm" />
        <div>
          <p className="font-medium text-foreground">{row.original.employee}</p>
          <p className="text-xs text-muted-foreground">{row.original.department}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span>,
  },
  {
    accessorKey: "checkIn",
    header: "Check In",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-foreground">{row.original.checkIn}</span>
    ),
  },
  {
    accessorKey: "checkOut",
    header: "Check Out",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-foreground">{row.original.checkOut}</span>
    ),
  },
  {
    accessorKey: "hours",
    header: "Working Hours",
    cell: ({ row }) => (
      <Badge variant="outline" className="tabular-nums">
        {row.original.hours}
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
];

interface AttendanceTableProps {
  refreshKey?: number;
}

export function AttendanceTable({ refreshKey }: AttendanceTableProps) {
  const [rows, setRows] = React.useState<AttendanceRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<AttendanceApiItem[]>("/attendance");
        if (cancelled) return;
        setRows(res.map(mapAttendance));
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
  }, [refreshKey]);

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
        title="Unable to load attendance records"
        description="Check that the backend API is reachable and you are signed in."
      />
    );
  }

  return <DataTable columns={columns} data={rows} />;
}
