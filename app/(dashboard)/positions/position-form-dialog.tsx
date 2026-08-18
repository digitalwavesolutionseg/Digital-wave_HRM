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

export interface PositionFormValue {
  id: string;
  title: string;
  departmentId: string;
  employmentType: string;
  minSalary: string | number | null;
  maxSalary: string | number | null;
  description?: string | null;
}

interface PositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  editing?: PositionFormValue | null;
}

interface DepartmentOption {
  id: string;
  name: string;
}

const emptyForm: PositionFormValue = {
  id: "",
  title: "",
  departmentId: "",
  employmentType: "FULL_TIME",
  minSalary: "",
  maxSalary: "",
  description: "",
};

export function PositionFormDialog({ open, onOpenChange, onSaved, editing }: PositionFormDialogProps) {
  const [form, setForm] = React.useState<PositionFormValue>(emptyForm);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
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
  }, [open]);

  React.useEffect(() => {
    if (editing) {
      setForm({
        id: editing.id,
        title: editing.title,
        departmentId: editing.departmentId,
        employmentType: editing.employmentType,
        minSalary: editing.minSalary,
        maxSalary: editing.maxSalary,
        description: editing.description ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [editing, open]);

  const update = <K extends keyof PositionFormValue>(key: K, value: PositionFormValue[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.departmentId || !form.minSalary || !form.maxSalary) {
      setError("Title, department, and salary range are required.");
      return;
    }
    if (Number(form.maxSalary) < Number(form.minSalary)) {
      setError("Max salary must be greater than or equal to min salary.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      const payload = {
        title: form.title.trim(),
        departmentId: form.departmentId,
        employmentType: form.employmentType,
        minSalary: Number(form.minSalary),
        maxSalary: Number(form.maxSalary),
        description: form.description || undefined,
      };
      if (editing) {
        await api.put(`/positions/${editing.id}`, payload);
        toast.success("Position updated");
      } else {
        await api.post("/positions", payload);
        toast.success("Position created");
      }
      onSaved();
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
        <DialogTitle>{editing ? "Edit Position" : "Post Position"}</DialogTitle>
        <DialogDescription>
          {editing ? "Update the position details." : "Create a new position within a department."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="pos-title">Title *</Label>
              <Input id="pos-title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Senior Software Engineer" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pos-dept">Department *</Label>
                <Select id="pos-dept" value={form.departmentId} onChange={(e) => update("departmentId", e.target.value)}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-type">Employment Type</Label>
                <Select id="pos-type" value={form.employmentType} onChange={(e) => update("employmentType", e.target.value)}>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                  <option value="PROBATION">Probation</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-min">Min Salary *</Label>
                <Input id="pos-min" type="number" min="0" step="0.01" value={form.minSalary ?? ""} onChange={(e) => update("minSalary", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-max">Max Salary *</Label>
                <Input id="pos-max" type="number" min="0" step="0.01" value={form.maxSalary ?? ""} onChange={(e) => update("maxSalary", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-desc">Description</Label>
              <Textarea id="pos-desc" value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editing ? "Save Changes" : "Create Position"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}