"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: "Active" | "On Leave" | "Probation" | "Inactive";
  salary: number;
  hireDate: string;
}

export interface EmployeeApiItem {
  id: string;
  employeeId: string;
  gender: string;
  departmentId: string;
  positionId: string;
  status: string;
  salary: number | string;
  joiningDate: string;
  department: { name: string } | null;
  position: { title: string } | null;
  user: { firstName: string; lastName: string; email: string } | null;
}

const statusVariant: Record<EmployeeRow["status"], "success" | "warning" | "info" | "muted"> = {
  Active: "success",
  "On Leave": "warning",
  Probation: "info",
  Inactive: "muted",
};

function makeColumns(onEdit: (row: EmployeeRow, item: EmployeeApiItem) => void, onDelete: (id: string) => void): ColumnDef<EmployeeRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => <span className="text-sm">{row.getValue("department")}</span>,
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => <span className="text-sm">{row.getValue("position")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue<EmployeeRow["status"]>("status");
        return <Badge variant={statusVariant[s]}>{s}</Badge>;
      },
    },
    {
      accessorKey: "salary",
      header: "Salary",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{formatCurrency(row.getValue<number>("salary"))}</span>
      ),
    },
    {
      accessorKey: "hireDate",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.getValue("hireDate"))}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="iconSm" onClick={() => (window.location.href = `/employees/${row.original.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="iconSm" onClick={() => onEdit(row.original, row.original as unknown as EmployeeApiItem)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="iconSm" onClick={() => onDelete(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}

function mapStatus(status: string): EmployeeRow["status"] {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "ON_LEAVE":
      return "On Leave";
    case "PENDING":
    case "SUSPENDED":
      return "Probation";
    default:
      return "Inactive";
  }
}

function mapEmployee(item: EmployeeApiItem): EmployeeRow {
  const name = item.user
    ? `${item.user.firstName} ${item.user.lastName}`
    : item.employeeId;
  return {
    id: item.id,
    name,
    email: item.user?.email ?? "—",
    department: item.department?.name ?? "—",
    position: item.position?.title ?? "—",
    status: mapStatus(item.status),
    salary: Number(item.salary),
    hireDate: item.joiningDate,
  };
}

function mapSortFilter(
  columns: ColumnDef<EmployeeRow>[],
  data: EmployeeRow[],
  search: string,
  departmentFilter: string,
  statusFilter: string
): EmployeeRow[] {
  void columns;
  const q = search.trim().toLowerCase();
  return data.filter((row) => {
    const matchesSearch =
      !q ||
      [row.name, row.email, row.department, row.position].some((v) =>
        v?.toLowerCase().includes(q)
      );
    const matchesDepartment = departmentFilter === "all" || row.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });
}

interface EmployeesTableProps {
  toolbar?: React.ReactNode;
  search?: string;
  departmentFilter?: string;
  statusFilter?: string;
  refreshKey?: number;
  onEdit?: (item: EmployeeApiItem) => void;
  onChanged?: () => void;
}

export function EmployeesTable({
  toolbar,
  search,
  departmentFilter,
  statusFilter,
  refreshKey,
  onEdit,
  onChanged,
}: EmployeesTableProps) {
  const [items, setItems] = React.useState<EmployeeApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchEmployees = React.useCallback(async () => {
    try {
      const { api } = await import("@/lib/api");
      const res = await api.get<{ data: EmployeeApiItem[] }>("/employees?limit=100");
      setItems(res.data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      await fetchEmployees();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, fetchEmployees]);

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this employee? This action cannot be undone.")) return;
      try {
        const { api } = await import("@/lib/api");
        await api.del(`/employees/${id}`);
        toast.success("Employee deleted");
        onChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      }
    },
    [onChanged]
  );

  const handleEdit = React.useCallback(
    (_row: EmployeeRow, item: EmployeeApiItem) => onEdit?.(item),
    [onEdit]
  );

  const rows = items.map(mapEmployee);
  const columns = React.useMemo(() => makeColumns(handleEdit, handleDelete), [handleEdit, handleDelete]);

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
        title="Unable to load employees"
        description="Check that the backend API is reachable and you are signed in."
      />
    );
  }

  const filtered = mapSortFilter(columns, rows, search ?? "", departmentFilter ?? "all", statusFilter ?? "all");
  return <DataTable columns={columns} data={filtered} toolbar={toolbar} />;
}
