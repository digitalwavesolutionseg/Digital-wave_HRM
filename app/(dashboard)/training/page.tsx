"use client";

import * as React from "react";
import { BookOpen, Clock, Plus, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type ProgramStatus = "ACTIVE" | "UPCOMING" | "COMPLETED";

interface TrainingProgram {
  id: string;
  name: string;
  category: string;
  duration: string;
  enrolled: number;
  progress: number;
  status: ProgramStatus;
  instructor: string;
}

interface TrainingApiItem {
  id: string;
  title: string;
  category: string;
  instructor: string;
  durationHours: number;
  description: string;
  status: ProgramStatus;
  _count: { enrollments: number };
}

function mapProgram(item: TrainingApiItem): TrainingProgram {
  return {
    id: item.id,
    name: item.title,
    category: item.category,
    duration: item.durationHours ? `${item.durationHours} hours` : "—",
    enrolled: item._count?.enrollments ?? 0,
    progress: 0,
    status: item.status,
    instructor: item.instructor ?? "—",
  };
}

function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  const map: Record<ProgramStatus, { label: string; variant: "info" | "warning" | "success" }> = {
    ACTIVE: { label: "Active", variant: "info" },
    UPCOMING: { label: "Upcoming", variant: "warning" },
    COMPLETED: { label: "Completed", variant: "success" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn(
          "h-full rounded-full",
          value >= 75 ? "bg-success" : value >= 50 ? "bg-primary" : "bg-warning"
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function TrainingPage() {
  const columns = React.useMemo<ColumnDef<TrainingProgram>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Course",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.id}</p>
          </div>
        ),
      },
      {
        accessorKey: "instructor",
        header: "Instructor",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.original.instructor} size="sm" />
            <span>{row.original.instructor}</span>
          </div>
        ),
      },
      {
        accessorKey: "enrolled",
        header: "Enrolled",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="tabular-nums">{row.original.enrolled}</span>
          </div>
        ),
      },
      {
        accessorKey: "progress",
        header: "Completion Rate",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProgressBar value={row.original.progress} className="w-24" />
            <span className="text-sm font-medium tabular-nums">{row.original.progress}%</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ProgramStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <Button variant="ghost" size="sm">
            View
          </Button>
        ),
      },
    ],
    []
  );

  const [programs, setPrograms] = React.useState<TrainingProgram[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<TrainingApiItem[]>("/training");
        if (cancelled) return;
        setPrograms(res.map(mapProgram));
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

  const featured = programs.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Training & Development"
        description="Upskill your team with curated programs, courses and certifications."
        actions={
          <>
            <Button variant="outline">Catalog</Button>
            <Button>
              <Plus className="h-4 w-4" />
              New Program
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Active Programs</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {programs.filter((p) => p.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Employees Enrolled</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {programs.reduce((acc, p) => acc + p.enrolled, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Programs</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-success">
              {programs.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Certifications Earned</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">342</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Featured Programs</h2>
          <p className="text-sm text-muted-foreground">Popular learning tracks your team is taking</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-3 h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load training programs"
            description="Check that the backend API is reachable and you are signed in."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((program) => (
              <Card key={program.id} className="flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{program.category}</Badge>
                    <ProgramStatusBadge status={program.status} />
                  </div>
                  <CardTitle className="pt-2 leading-snug">{program.name}</CardTitle>
                  <CardDescription className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {program.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {program.enrolled} enrolled
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={program.instructor} size="sm" />
                    <span className="text-sm text-muted-foreground">{program.instructor}</span>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{program.progress}%</span>
                    </div>
                    <ProgressBar value={program.progress} />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4" />
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">All Programs</h2>
          <p className="text-sm text-muted-foreground">Full catalog of training and development programs</p>
        </div>
        <DataTable columns={columns} data={programs} pagination />
      </div>
    </div>
  );
}
