"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

type AttendanceStatus = "On Time" | "Late" | "Absent" | "Leave";

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

const statusVariant: Record<AttendanceStatus, "success" | "warning" | "danger" | "info"> = {
  "On Time": "success",
  Late: "warning",
  Absent: "danger",
  Leave: "info",
};

const attendance: AttendanceRow[] = [
  { id: "a1", employee: "Omar El-Sayed", department: "Engineering", date: "2026-08-04", checkIn: "09:02 AM", checkOut: "06:10 PM", hours: "8h 10m", status: "On Time" },
  { id: "a2", employee: "Nour Hassan", department: "Sales", date: "2026-08-04", checkIn: "09:15 AM", checkOut: "06:30 PM", hours: "8h 15m", status: "On Time" },
  { id: "a3", employee: "Laila Kamal", department: "Marketing", date: "2026-08-04", checkIn: "09:48 AM", checkOut: "06:05 PM", hours: "7h 47m", status: "Late" },
  { id: "a4", employee: "Ahmed Farouk", department: "Operations", date: "2026-08-04", checkIn: "08:55 AM", checkOut: "05:40 PM", hours: "8h 05m", status: "On Time" },
  { id: "a5", employee: "Mona Adel", department: "Human Resources", date: "2026-08-04", checkIn: "—", checkOut: "—", hours: "0h", status: "Absent" },
  { id: "a6", employee: "Youssef Mansour", department: "Finance", date: "2026-08-04", checkIn: "—", checkOut: "—", hours: "0h", status: "Leave" },
  { id: "a7", employee: "Salma Tarek", department: "Customer Success", date: "2026-08-05", checkIn: "09:05 AM", checkOut: "06:20 PM", hours: "8h 15m", status: "On Time" },
  { id: "a8", employee: "Karim Nabil", department: "Product Design", date: "2026-08-05", checkIn: "09:34 AM", checkOut: "06:40 PM", hours: "8h 06m", status: "Late" },
  { id: "a9", employee: "Fatma Ibrahim", department: "Operations", date: "2026-08-05", checkIn: "08:58 AM", checkOut: "05:50 PM", hours: "8h 02m", status: "On Time" },
  { id: "a10", employee: "Hany Gerges", department: "Engineering", date: "2026-08-05", checkIn: "—", checkOut: "—", hours: "0h", status: "Absent" },
];

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

export function AttendanceTable() {
  return <DataTable columns={columns} data={attendance} />;
}