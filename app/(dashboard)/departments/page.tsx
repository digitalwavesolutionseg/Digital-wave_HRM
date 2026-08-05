import {
  Cpu,
  Megaphone,
  Plus,
  Settings2,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DepartmentsTable } from "./departments-table";

interface DepartmentCard {
  name: string;
  manager: string;
  employees: number;
  budget: number;
  icon: LucideIcon;
}

const departmentCards: DepartmentCard[] = [
  { name: "Engineering", manager: "Omar El-Sayed", employees: 48, budget: 1250000, icon: Cpu },
  { name: "Sales", manager: "Nour Hassan", employees: 36, budget: 540000, icon: TrendingUp },
  { name: "Marketing", manager: "Laila Kamal", employees: 24, budget: 310000, icon: Megaphone },
  { name: "Operations", manager: "Ahmed Farouk", employees: 52, budget: 680000, icon: Settings2 },
  { name: "Human Resources", manager: "Mona Adel", employees: 18, budget: 190000, icon: Users },
  { name: "Finance", manager: "Youssef Mansour", employees: 14, budget: 160000, icon: Wallet },
];

export default function DepartmentsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Departments"
        description="Organize your teams, budgets, and reporting lines."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departmentCards.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.name}
              className="group relative overflow-hidden rounded-[20px] border border-border bg-card p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/8 text-primary transition-colors group-hover:bg-primary/10">
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{dept.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Managed by {dept.manager}</p>
              <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-foreground">{dept.employees}</span>
                  Employees
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  {formatCurrency(dept.budget)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">All Departments</h2>
            <p className="text-sm text-muted-foreground">
              Complete overview of every department across Digital Wave.
            </p>
          </div>
        </div>
        <DepartmentsTable />
      </div>
    </div>
  );
}
