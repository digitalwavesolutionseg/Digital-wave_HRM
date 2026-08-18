"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Pencil, Search, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

type EmploymentType = string;

interface PositionRow {
  id: string;
  title: string;
  department: string;
  type: EmploymentType;
  openings: number;
  minSalary: number;
  maxSalary: number;
}

export interface PositionApiItem {
  id: string;
  title: string;
  departmentId: string;
  department: { id: string; name: string } | null;
  employmentType: EmploymentType;
  minSalary: number | string | null;
  maxSalary: number | string | null;
  description?: string | null;
  _count: { employees: number } | undefined;
}

const typeVariant: Record<string, "default" | "secondary" | "info" | "muted"> = {
  FULL_TIME: "default",
  PART_TIME: "secondary",
  CONTRACT: "info",
  INTERNSHIP: "muted",
  FULL_TIME_CONTRACT: "default",
};

function normalizeType(type: EmploymentType): string {
  switch (type) {
    case "FULL_TIME":
    case "FULL_TIME_CONTRACT":
      return "Full-time";
    case "PART_TIME":
      return "Part-time";
    case "CONTRACT":
      return "Contract";
    case "INTERNSHIP":
      return "Internship";
    default:
      return type ?? "Contract";
  }
}

function mapPosition(item: PositionApiItem): PositionRow {
  return {
    id: item.id,
    title: item.title,
    department: item.department?.name ?? "—",
    type: normalizeType(item.employmentType),
    openings: item._count?.employees ?? 0,
    minSalary: Number(item.minSalary ?? 0),
    maxSalary: Number(item.maxSalary ?? 0),
  };
}

function makeColumns(onEdit: (item: PositionApiItem) => void, onDelete: (id: string) => void): ColumnDef<PositionRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.id}</p>
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => <span className="text-sm">{row.original.department}</span>,
    },
    {
      accessorKey: "type",
      header: "Employment Type",
      cell: ({ row }) => (
        <Badge variant={typeVariant[row.original.type] ?? "default"}>{row.original.type}</Badge>
      ),
    },
    {
      accessorKey: "openings",
      header: "Openings",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.openings} {row.original.openings === 1 ? "slot" : "slots"}
        </Badge>
      ),
    },
    {
      id: "salary",
      header: "Salary Range",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(row.original.minSalary)} – {formatCurrency(row.original.maxSalary)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Edit"
            onClick={() => onEdit(row.original as unknown as PositionApiItem)}
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

interface PositionsTableProps {
  refreshKey?: number;
  onEdit?: (item: PositionApiItem) => void;
  onChanged?: () => void;
}

export function PositionsTable({ refreshKey, onEdit, onChanged }: PositionsTableProps) {
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState("All Departments");
  const [rows, setRows] = React.useState<PositionRow[]>([]);
  const [items, setItems] = React.useState<PositionApiItem[]>([]);
  const [departmentOptions, setDepartmentOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<PositionApiItem[]>("/positions");
        if (cancelled) return;
        setItems(res);
        setRows(res.map(mapPosition));
        setDepartmentOptions([
          "All Departments",
          ...Array.from(new Set(res.map((p) => p.department?.name).filter((n): n is string => !!n))),
        ]);
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
      if (!window.confirm("Delete this position?")) return;
      try {
        const { api } = await import("@/lib/api");
        await api.del(`/positions/${id}`);
        toast.success("Position deleted");
        onChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      }
    },
    [onChanged]
  );

  const handleEdit = React.useCallback(
    (item: PositionApiItem) => {
      const found = items.find((i) => i.id === item.id);
      onEdit?.(found ?? item);
    },
    [items, onEdit]
  );

  const filtered = rows.filter((position) => {
    const matchesSearch =
      search.trim() === "" ||
      position.title.toLowerCase().includes(search.toLowerCase()) ||
      position.id.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = department === "All Departments" || position.department === department;
    return matchesSearch && matchesDepartment;
  });

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or requisition ID..."
          className="pl-9"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="sm:w-48">
          {departmentOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            setDepartment("All Departments");
          }}
        >
          Reset
        </Button>
      </div>
      <span className="sm:ml-auto text-sm text-muted-foreground">
        {filtered.length} of {rows.length} positions
      </span>
    </div>
  );

  const columns = React.useMemo(() => makeColumns(handleEdit, handleDelete), [handleEdit, handleDelete]);

  if (loading) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load positions"
        description="Check that the backend API is reachable and you are signed in."
      />
    );
  }

  return <DataTable columns={columns} data={filtered} toolbar={toolbar} />;
}
