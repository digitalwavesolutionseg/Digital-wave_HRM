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

interface EmployeeOption {
  id: string;
  employeeId: string;
  user: { firstName: string; lastName: string } | null;
}

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function ReviewFormDialog({ open, onOpenChange, onCreated }: ReviewFormDialogProps) {
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [employeeId, setEmployeeId] = React.useState("");
  const [reviewerId, setReviewerId] = React.useState("");
  const [period, setPeriod] = React.useState("");
  const [rating, setRating] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<{ data: EmployeeOption[] }>("/employees?limit=100");
        if (cancelled) return;
        const emp = res.data;
        setEmployees(emp);
        setEmployeeId((prev) => (prev && emp.some((e) => e.id === prev) ? prev : emp[0]?.id ?? ""));
        setReviewerId((prev) => (prev && emp.some((e) => e.id === prev) ? prev : emp[0]?.id ?? ""));
      } catch {
        if (!cancelled) setError("Could not load employees.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !reviewerId || !period.trim()) {
      setError("Employee, reviewer, and period are required.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/performance/reviews", {
        employeeId,
        reviewerId,
        period: period.trim(),
        rating: rating !== "" ? Number(rating) : undefined,
        feedback: feedback.trim() || undefined,
        status: "DRAFT",
      });
      toast.success("Review created");
      onCreated();
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
        <DialogTitle>New Review</DialogTitle>
        <DialogDescription>Create a performance review cycle for an employee.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rev-employee">Employee *</Label>
                <Select id="rev-employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                  {employees.map((emp) => {
                    const name = emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : emp.employeeId;
                    return (
                      <option key={emp.id} value={emp.id}>
                        {name} ({emp.employeeId})
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rev-reviewer">Reviewer *</Label>
                <Select id="rev-reviewer" value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}>
                  {employees.map((emp) => {
                    const name = emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : emp.employeeId;
                    return (
                      <option key={emp.id} value={emp.id}>
                        {name} ({emp.employeeId})
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rev-period">Period *</Label>
                <Input id="rev-period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. Q3 2026" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rev-rating">Rating (1-5)</Label>
                <Input id="rev-rating" type="number" min={1} max={5} step={0.1} value={rating} onChange={(e) => setRating(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rev-feedback">Feedback</Label>
              <Textarea id="rev-feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || employees.length === 0}>
            {loading ? "Creating..." : "Create Review"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}