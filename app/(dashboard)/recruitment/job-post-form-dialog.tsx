"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUSES = ["OPEN", "ON_HOLD", "CLOSED"];

interface DepartmentOption {
  id: string;
  name: string;
}

interface JobPostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}

export function JobPostFormDialog({ open, onOpenChange, onPublished }: JobPostFormDialogProps) {
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [title, setTitle] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [openings, setOpenings] = React.useState("1");
  const [salaryRange, setSalaryRange] = React.useState("");
  const [status, setStatus] = React.useState("OPEN");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<DepartmentOption[]>("/departments");
        if (cancelled) return;
        setDepartments(res);
        setDepartmentId((prev) => (prev && res.some((d) => d.id === prev) ? prev : res[0]?.id ?? ""));
      } catch {
        /* non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !departmentId) {
      setError("Title and department are required.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/recruitment/job-posts", {
        title: title.trim(),
        departmentId,
        openings: Number(openings) || 1,
        salaryRange: salaryRange.trim() || undefined,
        status,
        description: description.trim() || undefined,
      });
      toast.success("Job post published");
      onPublished();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>New Job Post</DialogTitle>
        <DialogDescription>Create a job posting to start collecting applications.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="jp-title">Job title *</Label>
              <Input id="jp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jp-dept">Department *</Label>
                <Select id="jp-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jp-openings">Openings</Label>
                <Input id="jp-openings" type="number" min={1} value={openings} onChange={(e) => setOpenings(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jp-salary">Salary Range</Label>
                <Input id="jp-salary" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="e.g. $40k - $60k" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jp-status">Status</Label>
                <Select id="jp-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jp-desc">Description</Label>
              <Textarea id="jp-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities and requirements..." rows={4} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish Post"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}