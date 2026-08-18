"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssetOption {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
}

interface EmployeeOption {
  id: string;
  employeeId: string;
  user: { firstName: string; lastName: string } | null;
}

interface AssignAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}

export function AssignAssetDialog({ open, onOpenChange, onAssigned }: AssignAssetDialogProps) {
  const [assets, setAssets] = React.useState<AssetOption[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [assetId, setAssetId] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const [assetRes, empRes] = await Promise.all([
          api.get<AssetOption[]>("/assets"),
          api.get<{ data: EmployeeOption[] }>("/employees?limit=100"),
        ]);
        if (cancelled) return;
        const available = assetRes.filter(
          (a) => a.status === "AVAILABLE" || a.status === "MAINTENANCE"
        );
        setAssets(available);
        setEmployees(empRes.data);
        setAssetId((prev) => (prev && available.some((a) => a.id === prev) ? prev : available[0]?.id ?? ""));
        setEmployeeId((prev) => (prev && empRes.data.some((e) => e.id === prev) ? prev : empRes.data[0]?.id ?? ""));
        setError(null);
      } catch {
        if (!cancelled) setError("Could not load assets or employees.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !employeeId) {
      setError("Select an asset and an employee.");
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.patch(`/assets/${assetId}/assign`, { assignedToId: employeeId });
      toast.success("Asset assigned");
      onAssigned();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Assign failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedAsset = assets.find((a) => a.id === assetId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Assign Asset</DialogTitle>
        <DialogDescription>Assign an available asset to an employee.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="asset-select" className="text-sm font-medium">
                Asset *
              </label>
              <Select id="asset-select" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
                <option value="">Select asset</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.serialNumber})
                  </option>
                ))}
              </Select>
              {selectedAsset && (
                <p className="text-xs text-muted-foreground">
                  Current status: {selectedAsset.status}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="employee-select" className="text-sm font-medium">
                Assign To *
              </label>
              <Select id="employee-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                <option value="">Select employee</option>
                {employees.map((emp) => {
                  const name = emp.user
                    ? `${emp.user.firstName} ${emp.user.lastName}`
                    : emp.employeeId;
                  return (
                    <option key={emp.id} value={emp.id}>
                      {name} ({emp.employeeId})
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || assets.length === 0}>
            {loading ? "Assigning..." : "Assign Asset"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}