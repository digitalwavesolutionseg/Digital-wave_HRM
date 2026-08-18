"use client";

import * as React from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OpenAttendance {
  id: string;
  employeeId?: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
}

interface ClockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClocked: () => void;
  currentRecord?: OpenAttendance | null;
}

export function ClockDialog({ open, onOpenChange, onClocked, currentRecord }: ClockDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isClockedIn = !!currentRecord?.checkIn && !currentRecord?.checkOut;

  React.useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleAction = async (action: "clock-in" | "clock-out") => {
    setLoading(true);
    setError(null);
    try {
      const { api } = await import("@/lib/api");
      if (action === "clock-in") {
        await api.post("/attendance/clock-in", {});
      } else {
        await api.post("/attendance/clock-out", {
          id: currentRecord?.id,
        });
      }
      toast.success(action === "clock-in" ? "Checked in" : "Checked out");
      onClocked();
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
        <DialogTitle>{isClockedIn ? "Clock Out" : "Clock In"}</DialogTitle>
        <DialogDescription>
          {isClockedIn
            ? "You have an open session. Clock out to record your working hours."
            : "Start your working session for today."}
        </DialogDescription>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <div className="rounded-[14px] border border-border bg-muted/40 p-4 text-center">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary/8 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => handleAction(isClockedIn ? "clock-out" : "clock-in")}
          disabled={loading}
        >
          {loading ? "Processing..." : isClockedIn ? "Clock Out" : "Clock In"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
