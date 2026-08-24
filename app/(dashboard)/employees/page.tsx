"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Filter, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmployeesTable, EmployeeRow, EmployeeApiItem } from "./employees-table";
import { EmployeeFormDialog } from "./employee-form-dialog";

interface DepartmentOption {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  return (
    <Suspense>
      <EmployeesPageContent />
    </Suspense>
  );
}

function EmployeesPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeApiItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<DepartmentOption[]>("/departments");
        if (!cancelled) setDepartments(res);
      } catch {
        /* non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const { api } = await import("@/lib/api");
      const res = await api.get<{ data: EmployeeRow[] }>("/employees?limit=500");
      const rows = res.data;
      if (!rows.length) {
        toast.info("No employees to export");
        return;
      }
      const header = ["Name", "Email", "Department", "Position", "Status", "Salary", "Joined"];
      const lines = rows.map((e) =>
        [e.name, e.email, e.department, e.position, e.status, String(e.salary), e.hireDate]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const csv = [header.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }, []);

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-full sm:w-44">
        <option value="all">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.name}>
            {d.name}
          </option>
        ))}
      </Select>
      <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-36">
        <option value="all">All Status</option>
        <option value="Active">Active</option>
        <option value="On Leave">On Leave</option>
        <option value="Probation">Probation</option>
        <option value="Inactive">Inactive</option>
      </Select>
      <div className="flex items-center gap-2 sm:ml-auto">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Employees"
        description="Manage your workforce, profiles, and employment records."
      />
      <EmployeesTable
        toolbar={toolbar}
        search={search}
        departmentFilter={departmentFilter}
        statusFilter={statusFilter}
        onEdit={setEditing}
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((k) => k + 1)}
      />
      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
