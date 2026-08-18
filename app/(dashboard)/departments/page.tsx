"use client";

import * as React from "react";
import {
  Building2,
  Cpu,
  Megaphone,
  Plus,
  Settings2,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DepartmentsTable } from "./departments-table";
import { DepartmentFormDialog } from "./department-form-dialog";

interface DepartmentCard {
  name: string;
  manager: string;
  employees: number;
  positions: number;
  icon: LucideIcon;
}

interface DepartmentApiItem {
  id: string;
  name: string;
  description?: string | null;
  manager: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
  _count: { employees: number; positions: number };
}

const iconPool: LucideIcon[] = [Cpu, TrendingUp, Megaphone, Settings2, Users, Wallet, Building2];

function mapDepartment(item: DepartmentApiItem): DepartmentCard {
  const manager = item.manager?.user
    ? `${item.manager.user.firstName} ${item.manager.user.lastName}`
    : "—";
  return {
    name: item.name,
    manager,
    employees: item._count?.employees ?? 0,
    positions: item._count?.positions ?? 0,
    icon: iconPool[Math.abs(item.name.length) % iconPool.length] ?? Building2,
  };
}

export default function DepartmentsPage() {
  const [cards, setCards] = React.useState<DepartmentCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DepartmentApiItem | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<DepartmentApiItem[]>("/departments");
        if (cancelled) return;
        setCards(res.map(mapDepartment));
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

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Departments"
        description="Organize your teams, budgets, and reporting lines."
        actions={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[20px] border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <Skeleton className="h-12 w-12 rounded-[14px]" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-5 h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-48" />
              <div className="mt-5 border-t border-border pt-4">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Unable to load departments"
          description="Check that the backend API is reachable and you are signed in."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.name}
                className="group relative overflow-hidden rounded-[20px] border border-border bg-card p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/8 text-primary transition-colors group-hover:bg-primary/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{dept.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Managed by {dept.manager}</p>
                <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-foreground">{dept.employees}</span>
                    Employees
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium text-foreground">{dept.positions}</span>
                    Positions
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">All Departments</h2>
            <p className="text-sm text-muted-foreground">
              Complete overview of every department across Digital Wave.
            </p>
          </div>
        </div>
        <DepartmentsTable
          refreshKey={refreshKey}
          onEdit={(item) => { setEditing(item); setDialogOpen(true); }}
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <DepartmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
