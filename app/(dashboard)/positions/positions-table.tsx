"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type PositionStatus = "Open" | "On Hold" | "Filled" | "Paused";
type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";

interface PositionRow {
  id: string;
  title: string;
  department: string;
  type: EmploymentType;
  openings: number;
  minSalary: number;
  maxSalary: number;
  status: PositionStatus;
}

const statusVariant: Record<PositionStatus, "success" | "warning" | "muted" | "info"> = {
  Open: "success",
  "On Hold": "warning",
  Filled: "muted",
  Paused: "info",
};

const typeVariant: Record<EmploymentType, "default" | "secondary" | "info" | "muted"> = {
  "Full-time": "default",
  "Part-time": "secondary",
  Contract: "info",
  Internship: "muted",
};

const positions: PositionRow[] = [
  { id: "P-1001", title: "Senior Frontend Engineer", department: "Engineering", type: "Full-time", openings: 2, minSalary: 95000, maxSalary: 125000, status: "Open" },
  { id: "P-1002", title: "Backend Engineer (Node.js)", department: "Engineering", type: "Full-time", openings: 3, minSalary: 90000, maxSalary: 115000, status: "Open" },
  { id: "P-1003", title: "Sales Account Executive", department: "Sales", type: "Full-time", openings: 4, minSalary: 55000, maxSalary: 75000, status: "Open" },
  { id: "P-1004", title: "Marketing Manager", department: "Marketing", type: "Full-time", openings: 1, minSalary: 70000, maxSalary: 90000, status: "On Hold" },
  { id: "P-1005", title: "Data Analyst", department: "Operations", type: "Contract", openings: 1, minSalary: 45000, maxSalary: 60000, status: "Paused" },
  { id: "P-1006", title: "HR Business Partner", department: "Human Resources", type: "Full-time", openings: 1, minSalary: 65000, maxSalary: 85000, status: "Open" },
  { id: "P-1007", title: "Finance Controller", department: "Finance", type: "Full-time", openings: 1, minSalary: 100000, maxSalary: 130000, status: "Filled" },
  { id: "P-1008", title: "Product Designer (UX/UI)", department: "Marketing", type: "Contract", openings: 2, minSalary: 60000, maxSalary: 80000, status: "Open" },
  { id: "P-1009", title: "Customer Support Specialist", department: "Operations", type: "Part-time", openings: 5, minSalary: 25000, maxSalary: 35000, status: "Open" },
  { id: "P-1010", title: "QA Engineer", department: "Engineering", type: "Internship", openings: 1, minSalary: 15000, maxSalary: 20000, status: "Filled" },
  { id: "P-1011", title: "IT Administrator", department: "Operations", type: "Full-time", openings: 1, minSalary: 50000, maxSalary: 65000, status: "On Hold" },
  { id: "P-1012", title: "Growth Marketing Specialist", department: "Marketing", type: "Full-time", openings: 2, minSalary: 48000, maxSalary: 62000, status: "Open" },
];

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
  const [status, setStatus] = React.useState("All Statuses");

  const filtered = positions.filter((position) => {
    const matchesSearch =
      search.trim() === "" ||
      position.title.toLowerCase().includes(search.toLowerCase()) ||
      position.id.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment =
      department === "All Departments" || position.department === department;
    const matchesStatus = status === "All Statuses" || position.status === status;
    return matchesSearch && matchesDepartment && matchesStatus;
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
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40">
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            setDepartment("All Departments");
            setStatus("All Statuses");
          }}
        >
          Reset
        </Button>
      </div>
      <span className="sm:ml-auto text-sm text-muted-foreground">
        {filtered.length} of {positions.length} positions
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
        <Badge variant={typeVariant[row.original.type]}>{row.original.type}</Badge>
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
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
    },
  ];

  return <DataTable columns={columns} data={filtered} toolbar={toolbar} />;
}
