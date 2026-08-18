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

interface TrainingProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function TrainingProgramFormDialog({ open, onOpenChange, onCreated }: TrainingProgramFormDialogProps) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [instructor, setInstructor] = React.useState("");
  const [durationHours, setDurationHours] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setCategory("");
      setInstructor("");
      setDurationHours("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !durationHours) {
      setError("Title, category, and duration are required.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/training", {
        title: title.trim(),
        category: category.trim(),
        instructor: instructor.trim() || undefined,
        durationHours: Number(durationHours),
        description: description.trim() || undefined,
      });
      toast.success("Training program created");
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
        <DialogTitle>New Program</DialogTitle>
        <DialogDescription>Create a training program for your team.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="tr-title">Title *</Label>
              <Input id="tr-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced TypeScript" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tr-category">Category *</Label>
                <Input id="tr-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Engineering" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tr-instructor">Instructor</Label>
                <Input id="tr-instructor" value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="e.g. Dr. John Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-duration">Duration (hours) *</Label>
              <Input id="tr-duration" type="number" min={1} value={durationHours} onChange={(e) => setDurationHours(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-desc">Description</Label>
              <Textarea id="tr-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Program"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}