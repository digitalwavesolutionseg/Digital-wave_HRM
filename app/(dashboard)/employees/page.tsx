"use client";

import { useState } from "react";
import { Download, Filter, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmployeesTable } from "./employees-table";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");

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
      <Select defaultValue="all" className="w-full sm:w-44">
        <option value="all">All Departments</option>
        <option value="eng">Engineering</option>
        <option value="design">Design</option>
        <option value="sales">Sales</option>
        <option value="hr">HR</option>
      </Select>
      <Select defaultValue="all" className="w-full sm:w-36">
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="leave">On Leave</option>
        <option value="probation">Probation</option>
      </Select>
      <div className="flex items-center gap-2 sm:ml-auto">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
        <Button size="sm">
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
      <EmployeesTable toolbar={toolbar} search={search} />
    </div>
  );
}