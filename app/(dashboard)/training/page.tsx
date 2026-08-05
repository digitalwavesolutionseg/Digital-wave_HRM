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

const programs: TrainingProgram[] = [
  { id: "TP-09", name: "Leadership Essentials", category: "Leadership", duration: "12 weeks", enrolled: 84, progress: 68, status: "ACTIVE", instructor: "Daniela Ruiz" },
  { id: "TP-08", name: "Advanced React & TypeScript", category: "Engineering", duration: "8 weeks", enrolled: 156, progress: 45, status: "ACTIVE", instructor: "Kevin Osei" },
  { id: "TP-07", name: "Data Analytics Bootcamp", category: "Data", duration: "10 weeks", enrolled: 72, progress: 81, status: "ACTIVE", instructor: "Andre Souza" },
  { id: "TP-06", name: "Effective Communication", category: "Soft Skills", duration: "4 weeks", enrolled: 118, progress: 32, status: "UPCOMING", instructor: "Helen Grant" },
  { id: "TP-05", name: "Cloud Architecture (AWS)", category: "Engineering", duration: "6 weeks", enrolled: 96, progress: 57, status: "ACTIVE", instructor: "Nina Petrov" },
  { id: "TP-04", name: "DEI & Inclusive Leadership", category: "Culture", duration: "3 weeks", enrolled: 140, progress: 92, status: "COMPLETED", instructor: "Amara Okafor" },
  { id: "TP-03", name: "Negotiation Masterclass", category: "Soft Skills", duration: "5 weeks", enrolled: 65, progress: 21, status: "UPCOMING", instructor: "David Lin" },
  { id: "TP-02", name: "Cybersecurity Fundamentals", category: "Security", duration: "7 weeks", enrolled: 89, progress: 74, status: "ACTIVE", instructor: "Lena Fischer" },
];

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
            <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-success">
              {Math.round(programs.reduce((acc, p) => acc + p.progress, 0) / programs.length)}%
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
