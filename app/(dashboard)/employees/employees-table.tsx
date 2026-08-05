"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

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

const statusVariant: Record<EmployeeRow["status"], "success" | "warning" | "info" | "muted"> = {
  Active: "success",
  "On Leave": "warning",
  Probation: "info",
  Inactive: "muted",
};

const columns: ColumnDef<EmployeeRow>[] = [
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
    cell: () => (
      <div className="flex justify-end">
        <Button variant="ghost" size="iconSm">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="iconSm">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="iconSm">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];

export const employees: EmployeeRow[] = [
  {
    id: "EMP-1001",
    name: "Ahmed Nasser",
    email: "ahmed.nasser@digitalwave.solutions",
    department: "Engineering",
    position: "Lead Engineer",
    status: "Active",
    salary: 4200,
    hireDate: "2021-03-15",
  },
  {
    id: "EMP-1002",
    name: "Sara El-Masry",
    email: "sara.elmasry@digitalwave.solutions",
    department: "Design",
    position: "Product Designer",
    status: "Active",
    salary: 3600,
    hireDate: "2022-06-01",
  },
  {
    id: "EMP-1003",
    name: "Omar Fahmy",
    email: "omar.fahmy@digitalwave.solutions",
    department: "Engineering",
    position: "Backend Engineer",
    status: "On Leave",
    salary: 3400,
    hireDate: "2021-11-20",
  },
  {
    id: "EMP-1004",
    name: "Lina Hassan",
    email: "lina.hassan@digitalwave.solutions",
    department: "Marketing",
    position: "Marketing Lead",
    status: "Active",
    salary: 3100,
    hireDate: "2020-09-10",
  },
  {
    id: "EMP-1005",
    name: "Karim El-Shazly",
    email: "karim.shazly@digitalwave.solutions",
    department: "QA",
    position: "QA Engineer",
    status: "Probation",
    salary: 2600,
    hireDate: "2024-08-01",
  },
  {
    id: "EMP-1006",
    name: "Mona Adel",
    email: "mona.adel@digitalwave.solutions",
    department: "HR",
    position: "HR Specialist",
    status: "Active",
    salary: 2900,
    hireDate: "2022-02-14",
  },
  {
    id: "EMP-1007",
    name: "Youssef Samir",
    email: "youssef.samir@digitalwave.solutions",
    department: "Sales",
    position: "Account Manager",
    status: "On Leave",
    salary: 3200,
    hireDate: "2019-05-08",
  },
  {
    id: "EMP-1008",
    name: "Nour Ezzat",
    email: "nour.ezzat@digitalwave.solutions",
    department: "Finance",
    position: "Financial Analyst",
    status: "Active",
    salary: 3400,
    hireDate: "2023-01-22",
  },
  {
    id: "EMP-1009",
    name: "Hassan Ibrahim",
    email: "hassan.ibrahim@digitalwave.solutions",
    department: "Engineering",
    position: "Frontend Engineer",
    status: "Active",
    salary: 3500,
    hireDate: "2022-10-05",
  },
  {
    id: "EMP-1010",
    name: "Dina Mostafa",
    email: "dina.mostafa@digitalwave.solutions",
    department: "Operations",
    position: "Operations Manager",
    status: "Active",
    salary: 4000,
    hireDate: "2018-12-01",
  },
];

interface EmployeesTableProps {
  toolbar?: React.ReactNode;
}

export function EmployeesTable({ toolbar }: EmployeesTableProps) {
  return <DataTable columns={columns} data={employees} toolbar={toolbar} />;
}