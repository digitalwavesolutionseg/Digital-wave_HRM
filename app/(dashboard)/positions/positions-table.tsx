"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
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

interface PositionApiItem {
  id: string;
  title: string;
  department: { id: string; name: string } | null;
  employmentType: EmploymentType;
  minSalary: number | string | null;
  maxSalary: number | string | null;
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

function positionStatus(): string {
  return "Open";
}

const departments = [
  "All Departments",
  "Engineering",
  "Sales",
  "Marketing",
  "Operations",
  "Human Resources",
  "Finance",
];

const statuses = ["All Statuses", "Open", "On Hold", "Filled", "Paused"];

export function PositionsTable() {
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState("All Departments");
  const [rows, setRows] = React.useState<PositionRow[]>([]);
  const [departmentOptions, setDepartmentOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<PositionApiItem[]>("/positions");
        if (cancelled) return;
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
  }, []);

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

  const columns: ColumnDef<PositionRow>[] = [
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
      accessorKey: "status",
      header: "Status",
      cell: () => <Badge variant="success">Open</Badge>,
    },
  ];

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
