"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  editing?: { id: string; name: string; description?: string | null; managerId?: string | null } | null;
}

export function DepartmentFormDialog({ open, onOpenChange, onSaved, editing }: DepartmentFormDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
    setError(null);
  }, [editing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      const payload = { name: name.trim(), description: description.trim() || undefined };
      if (editing) {
        await api.put(`/departments/${editing.id}`, payload);
        toast.success("Department updated");
      } else {
        await api.post("/departments", payload);
        toast.success("Department created");
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
        <DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle>
        <DialogDescription>
          {editing ? "Update department details." : "Create a new department."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="dept-name">Name *</Label>
              <Input id="dept-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-desc">Description</Label>
              <Textarea id="dept-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editing ? "Save Changes" : "Create Department"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}