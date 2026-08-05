import { Briefcase, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PositionsTable } from "./positions-table";

export default function PositionsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Positions"
        description="Create and manage open requisitions across every department."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> Post Position
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-card p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/8 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="mr-auto">
          <p className="text-sm font-semibold">Recruitment Summary</p>
          <p className="text-xs text-muted-foreground">
            Active requisitions currently open for hiring
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">9</span>
          <span>Open</span>
        </div>
        <Badge variant="secondary">12 total positions</Badge>
      </div>

      <PositionsTable />
    </div>
  );
}