"use client";

import { Plus, Users, Wallet, UserPlus, Building2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function QuickActions() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Quick Actions
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Quick actions</DialogTitle>
          <DialogDescription>Choose an action to get started.</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="grid grid-cols-1 gap-3">
            <QuickActionItem icon={UserPlus} title="Add Employee" desc="Create a new employee record" />
            <QuickActionItem icon={Wallet} title="Process Payroll" desc="Run this month's payroll run" />
            <QuickActionItem icon={Building2} title="Create Department" desc="Add a new department" />
            <QuickActionItem icon={Users} title="Manage Teams" desc="View and organize your teams" />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

function QuickActionItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <button className="flex items-center gap-3 rounded-[14px] border border-border p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}