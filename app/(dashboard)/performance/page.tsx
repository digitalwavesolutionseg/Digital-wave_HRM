"use client";

import * as React from "react";
import { CheckCircle2, Clock, Plus, Star, Target } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";

type ReviewStatus = "DRAFT" | "SUBMITTED" | "COMPLETED";

interface Review {
  id: string;
  employee: string;
  role: string;
  period: string;
  rating: number;
  reviewer: string;
  status: ReviewStatus;
}

interface EmployeeGoal {
  id: string;
  employee: string;
  goal: string;
  progress: number;
}

const reviews: Review[] = [
  { id: "PRV-114", employee: "Sarah Chen", role: "Senior Frontend Engineer", period: "Q2 2026", rating: 4.5, reviewer: "Daniela Ruiz", status: "COMPLETED" },
  { id: "PRV-113", employee: "James Okafor", role: "Product Manager", period: "Q2 2026", rating: 4.3, reviewer: "Amara Okafor", status: "COMPLETED" },
  { id: "PRV-112", employee: "Priya Sharma", role: "Data Scientist", period: "Q2 2026", rating: 4.7, reviewer: "Andre Souza", status: "SUBMITTED" },
  { id: "PRV-111", employee: "Marcus Webb", role: "Sales Lead", period: "Q2 2026", rating: 3.9, reviewer: "Daniela Ruiz", status: "SUBMITTED" },
  { id: "PRV-110", employee: "Elena Petrova", role: "UX Designer", period: "Q2 2026", rating: 4.1, reviewer: "Helen Grant", status: "COMPLETED" },
  { id: "PRV-109", employee: "David Kim", role: "DevOps Engineer", period: "Q2 2026", rating: 4.4, reviewer: "Kevin Osei", status: "DRAFT" },
  { id: "PRV-108", employee: "Aisha Bello", role: "HR Business Partner", period: "Q1 2026", rating: 4.2, reviewer: "Amara Okafor", status: "COMPLETED" },
  { id: "PRV-107", employee: "Tomás Herrera", role: "Accountant", period: "Q1 2026", rating: 3.8, reviewer: "Nina Petrov", status: "SUBMITTED" },
  { id: "PRV-106", employee: "Lena Fischer", role: "Marketing Manager", period: "Q1 2026", rating: 4.0, reviewer: "Helen Grant", status: "COMPLETED" },
  { id: "PRV-105", employee: "Ryan Patel", role: "Backend Engineer", period: "Q1 2026", rating: 4.6, reviewer: "Kevin Osei", status: "DRAFT" },
];

const goals: EmployeeGoal[] = [
  { id: "G-01", employee: "Priya Sharma", goal: "Complete ML model deployment to production", progress: 90 },
  { id: "G-02", employee: "Sarah Chen", goal: "Ship Q3 platform redesign", progress: 72 },
  { id: "G-03", employee: "Marcus Webb", goal: "Exceed Q3 revenue target by 12%", progress: 81 },
  { id: "G-04", employee: "James Okafor", goal: "Launch mobile app v2 on time", progress: 45 },
  { id: "G-05", employee: "David Kim", goal: "Reduce CI pipeline time by 40%", progress: 38 },
  { id: "G-06", employee: "Elena Petrova", goal: "Deliver new design system to all squads", progress: 64 },
];

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { label: string; variant: "muted" | "info" | "success" }> = {
    DRAFT: { label: "Draft", variant: "muted" },
    SUBMITTED: { label: "Submitted", variant: "info" },
    COMPLETED: { label: "Completed", variant: "success" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < rounded ? "fill-warning text-warning" : "text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold tabular-nums">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function PerformancePage() {
  const columns = React.useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.employee} size="sm" />
            <div>
              <p className="font-medium text-foreground">{row.original.employee}</p>
              <p className="text-xs text-muted-foreground">{row.original.role}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "period",
        header: "Review Period",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.period}</span>,
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => <RatingStars rating={row.original.rating} />,
      },
      {
        accessorKey: "reviewer",
        header: "Reviewer",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.original.reviewer} size="sm" />
            <span>{row.original.reviewer}</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ReviewStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <Button variant="ghost" size="sm">
            Open
          </Button>
        ),
      },
    ],
    []
  );

  const onTrack = goals.filter((g) => g.progress >= 60).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Performance Reviews"
        description="Track review cycles, ratings and goal progress across the organization."
        actions={
          <>
            <Button variant="outline">Schedule Review</Button>
            <Button>
              <Plus className="h-4 w-4" />
              New Review
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Avg Rating"
          value="4.2"
          delta="+0.3"
          icon={<Star className="h-5 w-5" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Reviews Due"
          value="12"
          delta="-5"
          changeType="down"
          icon={<Clock className="h-5 w-5" />}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title="Goals On Track"
          value={`${Math.round((onTrack / goals.length) * 100)}%`}
          delta="+6%"
          icon={<Target className="h-5 w-5" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Completed"
          value="148"
          delta="+21"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Review Cycles</h2>
          <p className="text-sm text-muted-foreground">Latest submitted and completed reviews</p>
        </div>
        <DataTable columns={columns} data={reviews} pagination />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Team Goals</CardTitle>
            <CardDescription>Progress toward current quarter objectives</CardDescription>
          </div>
          <Badge variant="secondary">{onTrack} on track</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-[16px] border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={goal.employee} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{goal.employee}</p>
                    <p className="truncate text-xs text-muted-foreground">{goal.goal}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{goal.progress}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      goal.progress >= 75 ? "bg-success" : goal.progress >= 50 ? "bg-primary" : "bg-warning"
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
