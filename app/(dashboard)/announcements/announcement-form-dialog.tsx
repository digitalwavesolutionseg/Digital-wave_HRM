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

const CATEGORIES = ["EVENT", "POLICY", "NOTICE", "HR", "PAYROLL", "TRAINING", "GENERAL"];

interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}

export function AnnouncementFormDialog({ open, onOpenChange, onPublished }: AnnouncementFormDialogProps) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState("GENERAL");
  const [pinned, setPinned] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setCategory("GENERAL");
      setPinned(false);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and message are required.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/announcements", {
        title: title.trim(),
        body: body.trim(),
        category,
        pinned,
      });
      toast.success("Announcement published");
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
        <DialogTitle>New Announcement</DialogTitle>
        <DialogDescription>Publish an announcement to all employees.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title *</Label>
              <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Office closed Friday" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-category">Category</Label>
              <Select id="ann-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-body">Message *</Label>
              <Textarea id="ann-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the announcement details..." rows={5} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Pin this announcement
            </label>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish Announcement"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}