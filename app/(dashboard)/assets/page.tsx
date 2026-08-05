"use client";

import * as React from "react";
import {
  Package,
  UserCheck,
  PackageOpen,
  Wrench,
  Plus,
  Laptop,
  Monitor,
  HardDrive,
  Smartphone,
  Mouse,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

type Asset = {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  serial: string;
  assignedTo: string;
  condition: "EXCELLENT" | "GOOD" | "FAIR";
  status: "ASSIGNED" | "AVAILABLE" | "MAINTENANCE";
};

interface AssetApiItem {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  condition: Asset["condition"];
  status: Asset["status"];
  assignedTo: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
}

function assetIcon(category: string): React.ReactNode {
  switch (category) {
    case "LAPTOP":
    case "Laptop":
      return <Laptop className="h-4 w-4" />;
    case "MONITOR":
    case "Monitor":
      return <Monitor className="h-4 w-4" />;
    case "MOBILE":
    case "Mobile":
      return <Smartphone className="h-4 w-4" />;
    case "PERIPHERAL":
    case "Peripheral":
      return <Mouse className="h-4 w-4" />;
    case "HARDWARE":
    case "Hardware":
      return <HardDrive className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
}

function mapAsset(item: AssetApiItem): Asset {
  const assignedTo = item.assignedTo?.user
    ? `${item.assignedTo.user.firstName} ${item.assignedTo.user.lastName}`
    : "Unassigned";
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    icon: assetIcon(item.category),
    serial: item.serialNumber,
    assignedTo,
    condition: item.condition,
    status: item.status,
  };
}

const conditionVariant: Record<Asset["condition"], "success" | "info" | "warning"> = {
  EXCELLENT: "success",
  GOOD: "info",
  FAIR: "warning",
};

const statusVariant: Record<Asset["status"], "default" | "secondary" | "warning"> = {
  ASSIGNED: "default",
  AVAILABLE: "secondary",
  MAINTENANCE: "warning",
};

const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "name",
    header: "Asset",
    cell: ({ row }) => {
      const asset = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-primary/8 text-primary">
            {asset.icon}
          </div>
          <div>
            <p className="font-medium text-foreground">{asset.name}</p>
            <p className="text-xs text-muted-foreground">{asset.serial}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
  },
  {
    accessorKey: "serial",
    header: "Serial",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.serial}</span>,
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      const name = row.original.assignedTo;
      if (name === "Unassigned" || name === "Facilities") {
        return <span className="text-sm text-muted-foreground">{name}</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <Avatar name={name} size="sm" />
          <span className="text-sm">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => (
      <Badge variant={conditionVariant[row.original.condition]}>{row.original.condition}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
];

export default function AssetsPage() {
  const [rows, setRows] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<AssetApiItem[]>("/assets");
        if (cancelled) return;
        setRows(res.map(mapAsset));
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveStats = [
    { label: "Total Assets", value: String(rows.length), icon: <Package className="h-5 w-5" />, className: "" },
    {
      label: "Assigned",
      value: String(rows.filter((a) => a.status === "ASSIGNED").length),
      icon: <UserCheck className="h-5 w-5" />,
      className: "bg-success/10 text-success",
    },
    {
      label: "Available",
      value: String(rows.filter((a) => a.status === "AVAILABLE").length),
      icon: <PackageOpen className="h-5 w-5" />,
      className: "bg-info/10 text-info",
    },
    {
      label: "Under Maintenance",
      value: String(rows.filter((a) => a.status === "MAINTENANCE").length),
      icon: <Wrench className="h-5 w-5" />,
      className: "bg-warning/10 text-warning",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Company Assets"
        description="Track and manage hardware and equipment across the organization."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> Assign Asset
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{s.value}</p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary/8 text-primary ${s.className}`}
              >
                {s.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <EmptyState
          title="Unable to load assets"
          description="Check that the backend API is reachable and you are signed in."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          toolbar={
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Asset Inventory</h2>
                <p className="text-sm text-muted-foreground">All registered company assets</p>
              </div>
              <Badge variant="muted">{rows.length} assets</Badge>
            </div>
          }
        />
      )}
    </div>
  );
}