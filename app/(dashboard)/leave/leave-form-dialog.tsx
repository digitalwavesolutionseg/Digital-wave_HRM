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

export interface LeaveTypeOption {
  leaveTypeId: string;
  name: string;
  defaultDays: number;
  remaining: number;
}

interface LeaveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  employeeId?: string | null;
}

export function LeaveFormDialog({ open, onOpenChange, onSaved, employeeId }: LeaveFormDialogProps) {
  const [leaveTypes, setLeaveTypes] = React.useState<LeaveTypeOption[]>([]);
  const [leaveTypeId, setLeaveTypeId] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [days, setDays] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<LeaveTypeOption[]>(`/leave/balance/${employeeId ?? ""}`);
        if (cancelled) return;
        setLeaveTypes(res);
        setLeaveTypeId((prev) => (prev && res.some((t) => t.leaveTypeId === prev) ? prev : res[0]?.leaveTypeId ?? ""));
      } catch {
        if (!cancelled) setError("Could not load leave types.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, employeeId]);

  React.useEffect(() => {
    if (open && leaveTypes.length > 0) {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 1);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
      setDays("1");
      setReason("");
      setError(null);
    }
  }, [open, leaveTypes.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate || !days || !reason.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/leave", {
        leaveTypeId,
        startDate,
        endDate,
        days: Number(days),
        reason: reason.trim(),
      });
      toast.success("Leave request submitted");
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
        <DialogTitle>New Leave Request</DialogTitle>
        <DialogDescription>Submit a leave request for approval.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave Type *</Label>
              <Select id="leave-type" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} disabled={loading}>
                <option value="">Select leave type</option>
                {leaveTypes.map((t) => (
                  <option key={t.leaveTypeId} value={t.leaveTypeId}>
                    {t.name} ({t.remaining} remaining)
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leave-start">Start Date *</Label>
                <Input id="leave-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave-end">End Date *</Label>
                <Input id="leave-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-days">Days *</Label>
              <Input id="leave-days" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-reason">Reason *</Label>
              <Textarea id="leave-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain the reason for your leave." />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
