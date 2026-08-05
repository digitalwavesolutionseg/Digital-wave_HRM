"use client";

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
  Printer,
  Headphones,
  Keyboard,
  Mouse,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Category = "Laptop" | "Monitor" | "Hardware" | "Peripheral" | "Mobile";

type Asset = {
  id: string;
  name: string;
  category: Category;
  icon: React.ReactNode;
  serial: string;
  assignedTo: string;
  condition: "EXCELLENT" | "GOOD" | "FAIR";
  status: "ASSIGNED" | "AVAILABLE" | "MAINTENANCE";
};

const assets: Asset[] = [
  {
    id: "1",
    name: 'MacBook Pro 14"',
    category: "Laptop",
    icon: <Laptop className="h-4 w-4" />,
    serial: "DWMBP-00231",
    assignedTo: "Ava Thompson",
    condition: "EXCELLENT",
    status: "ASSIGNED",
  },
  {
    id: "2",
    name: "Dell UltraSharp U2723QE",
    category: "Monitor",
    icon: <Monitor className="h-4 w-4" />,
    serial: "DWUS-00847",
    assignedTo: "Liam Chen",
    condition: "GOOD",
    status: "ASSIGNED",
  },
  {
    id: "3",
    name: "Samsung Galaxy Tab S9",
    category: "Mobile",
    icon: <Smartphone className="h-4 w-4" />,
    serial: "DWGT-00412",
    assignedTo: "Unassigned",
    condition: "EXCELLENT",
    status: "AVAILABLE",
  },
  {
    id: "4",
    name: "Dell Precision 5680",
    category: "Laptop",
    icon: <Laptop className="h-4 w-4" />,
    serial: "DWPD-00903",
    assignedTo: "Maya Rodriguez",
    condition: "FAIR",
    status: "MAINTENANCE",
  },
  {
    id: "5",
    name: "Logitech MX Master 3S",
    category: "Peripheral",
    icon: <Mouse className="h-4 w-4" />,
    serial: "DWMM-00118",
    assignedTo: "Noah Williams",
    condition: "GOOD",
    status: "ASSIGNED",
  },
  {
    id: "6",
    name: "Keychron K8 Pro",
    category: "Peripheral",
    icon: <Keyboard className="h-4 w-4" />,
    serial: "DWKK-00556",
    assignedTo: "Olivia Bennett",
    condition: "EXCELLENT",
    status: "ASSIGNED",
  },
  {
    id: "7",
    name: "HP LaserJet Pro M404",
    category: "Hardware",
    icon: <Printer className="h-4 w-4" />,
    serial: "DWHL-00377",
    assignedTo: "Facilities",
    condition: "GOOD",
    status: "ASSIGNED",
  },
  {
    id: "8",
    name: "Samsung T7 SSD 2TB",
    category: "Hardware",
    icon: <HardDrive className="h-4 w-4" />,
    serial: "DWST-00724",
    assignedTo: "Unassigned",
    condition: "EXCELLENT",
    status: "AVAILABLE",
  },
  {
    id: "9",
    name: "Sony WH-1000XM5",
    category: "Peripheral",
    icon: <Headphones className="h-4 w-4" />,
    serial: "DWSH-00263",
    assignedTo: "Ethan Park",
    condition: "FAIR",
    status: "ASSIGNED",
  },
  {
    id: "10",
    name: "Surface Laptop Studio 2",
    category: "Laptop",
    icon: <Laptop className="h-4 w-4" />,
    serial: "DWSL-01002",
    assignedTo: "Sophia Garcia",
    condition: "GOOD",
    status: "ASSIGNED",
  },
  {
    id: "11",
    name: "LG UltraWide 34WP55",
    category: "Monitor",
    icon: <Monitor className="h-4 w-4" />,
    serial: "DWLG-00689",
    assignedTo: "Unassigned",
    condition: "GOOD",
    status: "AVAILABLE",
  },
  {
    id: "12",
    name: "iPad Pro 12.9",
    category: "Mobile",
    icon: <Smartphone className="h-4 w-4" />,
    serial: "DWP-00801",
    assignedTo: "James Wilson",
    condition: "EXCELLENT",
    status: "ASSIGNED",
  },
];

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

const stats = [
  { label: "Total Assets", value: "148", icon: <Package className="h-5 w-5" />, className: "" },
  {
    label: "Assigned",
    value: "112",
    icon: <UserCheck className="h-5 w-5" />,
    className: "bg-success/10 text-success",
  },
  {
    label: "Available",
    value: "24",
    icon: <PackageOpen className="h-5 w-5" />,
    className: "bg-info/10 text-info",
  },
  {
    label: "Under Maintenance",
    value: "12",
    icon: <Wrench className="h-5 w-5" />,
    className: "bg-warning/10 text-warning",
  },
];

export default function AssetsPage() {
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
        {stats.map((s) => (
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

      <DataTable
        columns={columns}
        data={assets}
        toolbar={
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Asset Inventory</h2>
              <p className="text-sm text-muted-foreground">All registered company assets</p>
            </div>
            <Badge variant="muted">{assets.length} assets</Badge>
          </div>
        }
      />
    </div>
  );
}