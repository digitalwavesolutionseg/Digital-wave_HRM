"use client";

import * as React from "react";
import { Briefcase, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PositionsTable, PositionApiItem } from "./positions-table";
import { PositionFormDialog } from "./position-form-dialog";

export default function PositionsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PositionApiItem | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Positions"
        description="Create and manage positions across every department."
        actions={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> Post Position
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-card p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/8 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="mr-auto">
          <p className="text-sm font-semibold">Position Directory</p>
          <p className="text-xs text-muted-foreground">
            Positions are managed within departments and used by recruitment and payroll.
          </p>
        </div>
        <Badge variant="secondary">Live directory</Badge>
      </div>

      <PositionsTable
        refreshKey={refreshKey}
        onEdit={setEditing}
        onChanged={() => setRefreshKey((k) => k + 1)}
      />

      <PositionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
