"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

interface JobPostOption {
  id: string;
  title: string;
}

interface CandidateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
  jobPosts?: JobPostOption[];
  defaultStage?: string;
}

export function CandidateFormDialog({ open, onOpenChange, onAdded, jobPosts = [], defaultStage = "APPLIED" }: CandidateFormDialogProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [jobPostId, setJobPostId] = React.useState("");
  const [stage, setStage] = React.useState(defaultStage);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPhone("");
      setStage(defaultStage);
      setJobPostId((prev) => (prev && jobPosts.some((j) => j.id === prev) ? prev : jobPosts[0]?.id ?? ""));
      setError(null);
    }
  }, [open, jobPosts, defaultStage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !jobPostId) {
      setError("Name, email, and job post are required.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/recruitment/candidates", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        jobPostId,
        stage,
      });
      toast.success("Candidate added");
      onAdded();
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
        <DialogTitle>Add Candidate</DialogTitle>
        <DialogDescription>Add a candidate to the hiring pipeline.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="cand-name">Full name *</Label>
              <Input id="cand-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Ahmed" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cand-email">Email *</Label>
              <Input id="cand-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cand-phone">Phone</Label>
              <Input id="cand-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 ..." />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cand-post">Job Post *</Label>
                <Select id="cand-post" value={jobPostId} onChange={(e) => setJobPostId(e.target.value)}>
                  <option value="">Select job post</option>
                  {jobPosts.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cand-stage">Stage</Label>
                <Select id="cand-stage" value={stage} onChange={(e) => setStage(e.target.value)}>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || jobPosts.length === 0}>
            {loading ? "Adding..." : "Add Candidate"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}