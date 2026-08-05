"use client";

import * as React from "react";
import { Building2, Plus, Search, Users, UserPlus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Input, Label, Textarea } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type JobStatus = "OPEN" | "ON_HOLD" | "CLOSED";

interface JobPost {
  id: string;
  title: string;
  department: string;
  applicants: number;
  openings: number;
  status: JobStatus;
}

interface PipelineCandidate {
  id: string;
  name: string;
  role: string;
  applied: string;
  score: number;
}

interface PipelineStage {
  id: string;
  title: string;
  dot: string;
  candidates: PipelineCandidate[];
}

interface JobPostApiItem {
  id: string;
  title: string;
  department: { name: string } | null;
  openings: number | string | null;
  status: JobStatus;
  salaryRange: string | null;
  _count: { candidates: number };
}

interface CandidateApiItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
  jobPost: { id: string; title: string } | null;
}

const stageConfig: Record<string, { title: string; dot: string }> = {
  APPLIED: { title: "Application Review", dot: "bg-muted-foreground" },
  SCREENING: { title: "Screening", dot: "bg-warning" },
  INTERVIEW: { title: "Interview", dot: "bg-primary" },
  OFFER: { title: "Offer", dot: "bg-[#8B5CF6]" },
  HIRED: { title: "Hired", dot: "bg-success" },
  REJECTED: { title: "Rejected", dot: "bg-destructive" },
};

const stageOrder = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

function mapJobPost(item: JobPostApiItem): JobPost {
  return {
    id: item.id,
    title: item.title,
    department: item.department?.name ?? "—",
    applicants: item._count?.candidates ?? 0,
    openings: Number(item.openings ?? 0),
    status: item.status,
  };
}

function buildPipeline(candidates: CandidateApiItem[]): PipelineStage[] {
  const grouped = new Map<string, PipelineCandidate[]>();
  for (const c of candidates) {
    const key = stageOrder.includes(c.stage) ? c.stage : "APPLIED";
    const list = grouped.get(key) ?? [];
    list.push({
      id: c.id,
      name: c.name,
      role: c.jobPost?.title ?? "Candidate",
      applied: c.email ?? "—",
      score: 0,
    });
    grouped.set(key, list);
  }
  return stageOrder.map((s) => ({
    id: s,
    title: stageConfig[s]?.title ?? s,
    dot: stageConfig[s]?.dot ?? "bg-muted-foreground",
    candidates: grouped.get(s) ?? [],
  }));
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; variant: "success" | "warning" | "muted" }> = {
    OPEN: { label: "Open", variant: "success" },
    ON_HOLD: { label: "On Hold", variant: "warning" },
    CLOSED: { label: "Closed", variant: "muted" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export default function RecruitmentPage() {
  const [postOpen, setPostOpen] = React.useState(false);
  const [jobPosts, setJobPosts] = React.useState<JobPost[]>([]);
  const [pipeline, setPipeline] = React.useState<PipelineStage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const [postsRes, candidatesRes] = await Promise.all([
          api.get<JobPostApiItem[]>("/recruitment/job-posts"),
          api.get<CandidateApiItem[]>("/recruitment/candidates"),
        ]);
        if (cancelled) return;
        setJobPosts(postsRes.map(mapJobPost));
        setPipeline(buildPipeline(candidatesRes));
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

  const columns = React.useMemo<ColumnDef<JobPost>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Job Post",
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.department}</span>
          </div>
        ),
      },
      {
        accessorKey: "applicants",
        header: "Applicants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="tabular-nums">{row.original.applicants}</span>
          </div>
        ),
      },
      {
        accessorKey: "openings",
        header: "Openings",
        cell: ({ row }) => <span className="tabular-nums">{row.original.openings}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <JobStatusBadge status={row.original.status} />,
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

  const totalApplicants = pipeline.reduce((acc, s) => acc + s.candidates.length, 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Recruitment"
        description="Manage job posts and track candidates through the hiring pipeline."
        actions={
          <Button onClick={() => setPostOpen(true)}>
            <Plus className="h-4 w-4" />
            New Job Post
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Active Posts</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{jobPosts.filter((j) => j.status === "OPEN").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">In Pipeline</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{totalApplicants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Interviews</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {pipeline.find((s) => s.id === "interview")?.candidates.length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Hired This Month</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-success">
              {pipeline.find((s) => s.id === "HIRED")?.candidates.length ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Hiring Pipeline</CardTitle>
            <CardDescription>Drag candidates across stages as they advance</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4" />
            Search candidates
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[260px] shrink-0 space-y-2.5 rounded-[16px] bg-muted/50 p-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-24 w-full rounded-[14px]" />
                  <Skeleton className="h-24 w-full rounded-[14px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load candidates"
              description="Check that the backend API is reachable and you are signed in."
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
            {pipeline.map((stage) => (
              <div key={stage.id} className="w-[260px] shrink-0 rounded-[16px] bg-muted/50 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", stage.dot)} />
                    <span className="text-sm font-semibold">{stage.title}</span>
                  </div>
                  <Badge variant="outline">{stage.candidates.length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {stage.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="rounded-[14px] border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={candidate.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{candidate.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{candidate.role}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">{candidate.applied}</span>
                            <Badge variant={candidate.score >= 85 ? "success" : "secondary"}>{candidate.score}%</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full border border-dashed border-border text-muted-foreground">
                    <Plus className="h-4 w-4" />
                    Add candidate
                  </Button>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Job Posts</h2>
          <p className="text-sm text-muted-foreground">{jobPosts.length} active and historical positions</p>
        </div>
        {loading ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
        <DataTable
          columns={columns}
          data={jobPosts}
          pagination
          toolbar={
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search job posts..." />
              </div>
              <div className="w-40">
                <Select defaultValue="all">
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="hold">On Hold</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>
            </div>
          }
        />
        )}
      </div>

      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogHeader>
          <DialogTitle>New Job Post</DialogTitle>
          <DialogDescription>Create a job posting to start collecting applications.</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Job title</Label>
              <Input placeholder="e.g. Senior Frontend Engineer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select defaultValue="engineering">
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="people">People</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Openings</Label>
                <Input type="number" defaultValue={1} min={1} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the role, responsibilities and requirements..." />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPostOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setPostOpen(false)}>
            <UserPlus className="h-4 w-4" />
            Publish Post
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
