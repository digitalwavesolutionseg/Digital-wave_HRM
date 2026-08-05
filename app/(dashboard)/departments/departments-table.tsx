"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Eye, Pencil, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";

type DepartmentStatus = "Active" | "Restructuring" | "On Hold";

interface DepartmentRow {
  id: string;
  name: string;
  manager: string;
  employees: number;
  budget: number;
  status: DepartmentStatus;
}

const statusVariant: Record<DepartmentStatus, "success" | "warning" | "muted"> = {
  Active: "success",
  Restructuring: "warning",
  "On Hold": "muted",
};

const departments: DepartmentRow[] = [
  { id: "d1", name: "Engineering", manager: "Omar El-Sayed", employees: 48, budget: 1250000, status: "Active" },
  { id: "d2", name: "Sales", manager: "Nour Hassan", employees: 36, budget: 540000, status: "Active" },
  { id: "d3", name: "Marketing", manager: "Laila Kamal", employees: 24, budget: 310000, status: "Active" },
  { id: "d4", name: "Operations", manager: "Ahmed Farouk", employees: 52, budget: 680000, status: "Active" },
  { id: "d5", name: "Human Resources", manager: "Mona Adel", employees: 18, budget: 190000, status: "Active" },
  { id: "d6", name: "Finance", manager: "Youssef Mansour", employees: 14, budget: 160000, status: "Restructuring" },
  { id: "d7", name: "Customer Success", manager: "Salma Tarek", employees: 22, budget: 240000, status: "Active" },
  { id: "d8", name: "Product Design", manager: "Karim Nabil", employees: 12, budget: 150000, status: "On Hold" },
];

const columns: ColumnDef<DepartmentRow>[] = [
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
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(row.original.budget)}
      </span>
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
    cell: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="iconSm" aria-label="View">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="iconSm" aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="iconSm" aria-label="Delete" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function DepartmentsTable() {
  return <DataTable columns={columns} data={departments} />;
}
