"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Building2, Eye, Pencil, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface DepartmentRow {
  id: string;
  name: string;
  manager: string;
  employees: number;
  status: string;
}

export interface DepartmentApiItem {
  id: string;
  name: string;
  description?: string | null;
  manager: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
  _count: { employees: number; positions: number };
}

function makeColumns(onEdit: (item: DepartmentApiItem) => void, onDelete: (id: string) => void): ColumnDef<DepartmentRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary/8 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.id.toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "manager",
      header: "Manager",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.original.manager} size="sm" />
          <span className="text-sm text-foreground">{row.original.manager}</span>
        </div>
      ),
    },
    {
      accessorKey: "employees",
      header: "Employees",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium text-foreground">{row.original.employees}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => <Badge variant="success">Active</Badge>,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="iconSm" aria-label="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Edit"
            onClick={() => onEdit(row.original as unknown as DepartmentApiItem)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Delete"
            className="text-destructive"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

function mapDepartment(item: DepartmentApiItem): DepartmentRow {
  const manager = item.manager?.user
    ? `${item.manager.user.firstName} ${item.manager.user.lastName}`
    : "—";
  return {
    id: item.id,
    name: item.name,
    manager,
    employees: item._count?.employees ?? 0,
    status: "Active",
  };
}

interface DepartmentsTableProps {
  refreshKey?: number;
  onEdit?: (item: DepartmentApiItem) => void;
  onChanged?: () => void;
}

export function DepartmentsTable({ refreshKey, onEdit, onChanged }: DepartmentsTableProps) {
  const [rows, setRows] = React.useState<DepartmentRow[]>([]);
  const [items, setItems] = React.useState<DepartmentApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<DepartmentApiItem[]>("/departments");
        if (cancelled) return;
        setItems(res);
        setRows(res.map(mapDepartment));
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

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this department?")) return;
      try {
        const { api } = await import("@/lib/api");
        await api.del(`/departments/${id}`);
        toast.success("Department deleted");
        onChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      }
    },
    [onChanged]
  );

  const handleEdit = React.useCallback(
    (item: DepartmentApiItem) => {
      const found = items.find((i) => i.id === item.id);
      onEdit?.(found ?? item);
    },
    [items, onEdit]
  );

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
        title="Unable to load departments"
        description="Check that the backend API is reachable and you are signed in."
      />
    );
  }

  return <DataTable columns={columns} data={rows} />;
}
