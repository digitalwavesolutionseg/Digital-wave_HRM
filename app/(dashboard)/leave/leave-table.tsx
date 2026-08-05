"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

type LeaveType = "Vacation" | "Sick Leave" | "Personal" | "Unpaid";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveRow {
  id: string;
  employee: string;
  department: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
}

const typeVariant: Record<LeaveType, "info" | "danger" | "secondary" | "muted"> = {
  Vacation: "info",
  "Sick Leave": "danger",
  Personal: "secondary",
  Unpaid: "muted",
};

const statusVariant: Record<LeaveStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const leaveRequests: LeaveRow[] = [
  { id: "LV-2041", employee: "Nour Hassan", department: "Sales", type: "Vacation", from: "2026-08-10", to: "2026-08-14", days: 5, status: "PENDING" },
  { id: "LV-2040", employee: "Omar El-Sayed", department: "Engineering", type: "Sick Leave", from: "2026-08-06", to: "2026-08-07", days: 2, status: "PENDING" },
  { id: "LV-2039", employee: "Laila Kamal", department: "Marketing", type: "Personal", from: "2026-08-12", to: "2026-08-12", days: 1, status: "PENDING" },
  { id: "LV-2038", employee: "Ahmed Farouk", department: "Operations", type: "Vacation", from: "2026-09-01", to: "2026-09-07", days: 7, status: "APPROVED" },
  { id: "LV-2037", employee: "Mona Adel", department: "Human Resources", type: "Sick Leave", from: "2026-07-20", to: "2026-07-22", days: 3, status: "APPROVED" },
  { id: "LV-2036", employee: "Youssef Mansour", department: "Finance", type: "Vacation", from: "2026-07-05", to: "2026-07-09", days: 5, status: "APPROVED" },
  { id: "LV-2035", employee: "Salma Tarek", department: "Customer Success", type: "Personal", from: "2026-07-28", to: "2026-07-28", days: 1, status: "REJECTED" },
  { id: "LV-2034", employee: "Hany Gerges", department: "Engineering", type: "Unpaid", from: "2026-08-20", to: "2026-08-24", days: 5, status: "PENDING" },
  { id: "LV-2033", employee: "Fatma Ibrahim", department: "Operations", type: "Sick Leave", from: "2026-08-03", to: "2026-08-05", days: 3, status: "APPROVED" },
  { id: "LV-2032", employee: "Karim Nabil", department: "Product Design", type: "Vacation", from: "2026-07-14", to: "2026-07-16", days: 3, status: "APPROVED" },
];

const columns: ColumnDef<LeaveRow>[] = [
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant={typeVariant[row.original.type]}>{row.original.type}</Badge>,
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
      row.original.status === "PENDING" ? (
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="iconSm" className="text-success" aria-label="Approve">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="iconSm" className="text-destructive" aria-label="Reject">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];

export function LeaveTable() {
  return <DataTable columns={columns} data={leaveRequests} />;
}