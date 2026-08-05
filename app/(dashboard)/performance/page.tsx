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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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

interface ReviewApiItem {
  id: string;
  period: string;
  rating: number | string | null;
  status: ReviewStatus;
  employee: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
  reviewer: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
}

interface GoalApiItem {
  id: string;
  title: string;
  description: string;
  progress: number | string;
  employee: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
}

function personName(p: { employeeId: string; user: { firstName: string; lastName: string } | null } | null) {
  return p?.user ? `${p.user.firstName} ${p.user.lastName}` : p?.employeeId ?? "—";
}

function mapReview(item: ReviewApiItem): Review {
  return {
    id: item.id,
    employee: personName(item.employee),
    role: "—",
    period: item.period,
    rating: Number(item.rating ?? 0),
    reviewer: personName(item.reviewer),
    status: item.status,
  };
}

function mapGoal(item: GoalApiItem): EmployeeGoal {
  return {
    id: item.id,
    employee: personName(item.employee),
    goal: item.title,
    progress: Number(item.progress ?? 0),
  };
}

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
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [goals, setGoals] = React.useState<EmployeeGoal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const [reviewsRes, goalsRes] = await Promise.all([
          api.get<ReviewApiItem[]>("/performance/reviews"),
          api.get<GoalApiItem[]>("/performance/goals"),
        ]);
        if (cancelled) return;
        setReviews(reviewsRes.map(mapReview));
        setGoals(goalsRes.map(mapGoal));
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
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const reviewsDue = reviews.filter((r) => r.status === "DRAFT").length;
  const completed = reviews.filter((r) => r.status === "COMPLETED").length;

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
          value={avgRating}
          delta=""
          icon={<Star className="h-5 w-5" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Reviews Due"
          value={String(reviewsDue)}
          delta=""
          changeType="down"
          icon={<Clock className="h-5 w-5" />}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title="Goals On Track"
          value={`${goals.length ? Math.round((onTrack / goals.length) * 100) : 0}%`}
          delta=""
          icon={<Target className="h-5 w-5" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Completed"
          value={String(completed)}
          delta=""
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Review Cycles</h2>
          <p className="text-sm text-muted-foreground">Latest submitted and completed reviews</p>
        </div>
        {loading ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load performance data"
            description="Check that the backend API is reachable and you are signed in."
          />
        ) : (
          <DataTable columns={columns} data={reviews} pagination />
        )}
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
