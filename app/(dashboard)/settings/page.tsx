"use client";

import * as React from "react";
import { useState } from "react";
import {
  Building2,
  CalendarClock,
  ScrollText,
  Wallet,
  Mail,
  Palette,
  Shield,
  Bell,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

type SectionId =
  | "company"
  | "working-days"
  | "leave"
  | "payroll"
  | "templates"
  | "branding"
  | "permissions"
  | "notifications";

const sections: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: "company", label: "Company Settings", icon: <Building2 className="h-4 w-4" /> },
  { id: "working-days", label: "Working Days", icon: <CalendarClock className="h-4 w-4" /> },
  { id: "leave", label: "Leave Policies", icon: <ScrollText className="h-4 w-4" /> },
  { id: "payroll", label: "Payroll Settings", icon: <Wallet className="h-4 w-4" /> },
  { id: "templates", label: "Email Templates", icon: <Mail className="h-4 w-4" /> },
  { id: "branding", label: "Branding", icon: <Palette className="h-4 w-4" /> },
  { id: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
];

type Role = {
  id: string;
  name: string;
  members: number;
  permissions: string;
};

const roles: Role[] = [
  { id: "1", name: "Administrator", members: 5, permissions: "Full access to all modules and settings" },
  { id: "2", name: "HR Manager", members: 8, permissions: "Employees, payroll, leave, recruitment" },
  { id: "3", name: "Team Lead", members: 24, permissions: "Team directory, approvals, timesheets" },
  { id: "4", name: "Finance", members: 6, permissions: "Payroll, reports, expenses" },
  { id: "5", name: "Employee", members: 211, permissions: "Self-service: profile, leave, payslips" },
];

const roleVariant: Record<string, "default" | "info" | "warning" | "secondary" | "success"> = {
  Administrator: "default",
  "HR Manager": "info",
  "Team Lead": "warning",
  Finance: "success",
  Employee: "secondary",
};

const roleColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Role",
    cell: ({ row }) => <Badge variant={roleVariant[row.original.name]}>{row.original.name}</Badge>,
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => <span className="font-medium">{row.original.members}</span>,
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.permissions}</span>,
  },
];

function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  onSave,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button onClick={onSave}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("company");
  const [settings, setSettings] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<Record<string, any>>("/settings");
        if (cancelled) return;
        setSettings(res);
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

  const getSetting = (key: string, fallback = "") => {
    const value = settings[key];
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Settings"
        description="Manage organization configuration, policies and preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <nav className="flex gap-1 overflow-x-auto rounded-[16px] border border-border bg-card p-2 shadow-[0_6px_24px_rgba(0,0,0,0.04)] lg:flex-col">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-[12px] px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
                  active === s.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ) : error ? (
            <EmptyState
              title="Unable to load settings"
              description="Check that the backend API is reachable and you are signed in."
            />
          ) : (
          <>
          {active === "company" && (
            <SectionCard
              title="Company Settings"
              description="Basic information about your organization."
            >
              <FormField label="Company Name">
                <Input defaultValue={getSetting("companyName", "Digital Wave Inc.")} />
              </FormField>
              <FormField label="Legal Entity">
                <Input defaultValue={getSetting("legalEntity", "Digital Wave Holdings LLC")} />
              </FormField>
              <FormField label="Tax ID / Registration Number">
                <Input defaultValue={getSetting("taxId", "DW-8842-1930")} />
              </FormField>
              <FormField label="Country">
                <Select defaultValue={getSetting("country", "US")}>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="IN">India</option>
                </Select>
              </FormField>
              <FormField label="Timezone">
                <Select defaultValue={getSetting("timezone", "est")}>
                  <option value="est">(GMT-5) Eastern Time</option>
                  <option value="pst">(GMT-8) Pacific Time</option>
                  <option value="gmt">(GMT+0) Greenwich Mean Time</option>
                  <option value="gst">(GMT+4) Gulf Standard Time</option>
                </Select>
              </FormField>
              <FormField label="Default Currency">
                <Select defaultValue={getSetting("currency", "usd")}>
                  <option value="usd">USD — US Dollar</option>
                  <option value="eur">EUR — Euro</option>
                  <option value="aed">AED — UAE Dirham</option>
                  <option value="inr">INR — Indian Rupee</option>
                </Select>
              </FormField>
              <FormField label="Head Office Address" hint="Used on official documents and contracts.">
                <Textarea
                  rows={3}
                  defaultValue={getSetting("address", "1201 Innovation Drive, Suite 400, Austin, TX 78701")}
                />
              </FormField>
              <FormField label="Company Website">
                <Input defaultValue={getSetting("website", "https://digitalwave.example.com")} />
              </FormField>
            </SectionCard>
          )}

          {active === "working-days" && (
            <SectionCard
              title="Working Days"
              description="Define the standard workweek and office hours."
            >
              <FormField label="Weekly Working Days">
                <Select defaultValue="5">
                  <option value="5">Monday — Friday</option>
                  <option value="6">Monday — Saturday</option>
                  <option value="4">Monday — Thursday</option>
                </Select>
              </FormField>
              <FormField label="Start of Work Week">
                <Select defaultValue="mon">
                  <option value="mon">Monday</option>
                  <option value="sun">Sunday</option>
                  <option value="sat">Saturday</option>
                </Select>
              </FormField>
              <FormField label="Standard Start Time">
                <Select defaultValue="9">
                  <option value="8">8:00 AM</option>
                  <option value="9">9:00 AM</option>
                  <option value="10">10:00 AM</option>
                </Select>
              </FormField>
              <FormField label="Standard End Time">
                <Select defaultValue="6">
                  <option value="5">5:00 PM</option>
                  <option value="6">6:00 PM</option>
                  <option value="7">7:00 PM</option>
                </Select>
              </FormField>
              <FormField label="Weekly Hours Cap" hint="Overtime is calculated beyond this limit.">
                <Input type="number" defaultValue="40" />
              </FormField>
              <FormField label="Break Duration">
                <Select defaultValue="60">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </Select>
              </FormField>
            </SectionCard>
          )}

          {active === "leave" && (
            <SectionCard
              title="Leave Policies"
              description="Configure leave types, accrual and approval flow."
            >
              <FormField label="Default Annual Leave">
                <Input type="number" defaultValue="24" />
              </FormField>
              <FormField label="Accrual Model">
                <Select defaultValue="monthly">
                  <option value="monthly">Monthly accrual</option>
                  <option value="annual">Annual lump sum</option>
                  <option value="lump">At joining</option>
                </Select>
              </FormField>
              <FormField label="Carryover Limit" hint="Unused days that roll over to next year.">
                <Input type="number" defaultValue="10" />
              </FormField>
              <FormField label="Approval Workflow">
                <Select defaultValue="manager">
                  <option value="manager">Direct manager</option>
                  <option value="hr">HR department</option>
                  <option value="both">Manager + HR</option>
                </Select>
              </FormField>
              <FormField label="Sick Leave Entitlement">
                <Input type="number" defaultValue="12" />
              </FormField>
              <FormField label="Maternity Leave (weeks)">
                <Input type="number" defaultValue="16" />
              </FormField>
              <FormField label="Paternity Leave (weeks)">
                <Input type="number" defaultValue="2" />
              </FormField>
              <FormField label="Holiday Calendar">
                <Select defaultValue="us">
                  <option value="us">United States holidays</option>
                  <option value="global">Global / custom</option>
                  <option value="custom">Company-specific</option>
                </Select>
              </FormField>
            </SectionCard>
          )}

          {active === "payroll" && (
            <SectionCard
              title="Payroll Settings"
              description="Pay cycle, contribution and statutory configuration."
            >
              <FormField label="Pay Cycle">
                <Select defaultValue="monthly">
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </FormField>
              <FormField label="Payment Day">
                <Select defaultValue="1">
                  <option value="1">1st of the month</option>
                  <option value="25">25th of the month</option>
                  <option value="last">Last working day</option>
                </Select>
              </FormField>
              <FormField label="Overtime Rate">
                <Select defaultValue="1.5">
                  <option value="1.5">1.5x — time and a half</option>
                  <option value="2">2x — double time</option>
                  <option value="1">1x — standard</option>
                </Select>
              </FormField>
              <FormField label="Pension / Retirement Contribution (%)">
                <Input type="number" defaultValue="6" />
              </FormField>
              <FormField label="Employer Health Premium (%)">
                <Input type="number" defaultValue="4" />
              </FormField>
              <FormField label="Payroll Approval">
                <Select defaultValue="hr">
                  <option value="hr">HR Manager approval</option>
                  <option value="finance">Finance approval</option>
                  <option value="both">HR + Finance</option>
                </Select>
              </FormField>
            </SectionCard>
          )}

          {active === "templates" && (
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Customize automated emails sent to employees.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Welcome Onboarding", desc: "Sent to new hires on their start date" },
                  { name: "Leave Approved", desc: "Sent when a leave request is approved" },
                  { name: "Payslip Ready", desc: "Sent when a payslip is published" },
                  { name: "Expense Reimbursed", desc: "Sent when an expense is reimbursed" },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between rounded-[14px] border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="h-4 w-4" /> New Template
                </Button>
              </CardContent>
            </Card>
          )}

          {active === "branding" && (
            <SectionCard
              title="Branding"
              description="Customize the look and feel of the employee portal."
            >
              <FormField label="Logo">
                <div className="flex h-24 items-center justify-center rounded-[14px] border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                  Drop your logo here or browse files
                </div>
              </FormField>
              <FormField label="Primary Brand Color">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-[12px] border border-border bg-primary" />
                  <Input defaultValue="#0B5FFF" className="font-mono" />
                </div>
              </FormField>
              <FormField label="Theme">
                <Select defaultValue="light">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">Follow system</option>
                </Select>
              </FormField>
              <FormField label="Company Tagline">
                <Input defaultValue="Work made simple" />
              </FormField>
            </SectionCard>
          )}

          {active === "permissions" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>
                    Control what each role can access across Digital Wave HRM.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={roleColumns}
                    data={roles}
                    pagination={false}
                    toolbar={
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{roles.length} roles defined</p>
                        <Button size="sm">
                          <Plus className="h-4 w-4" /> New Role
                        </Button>
                      </div>
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Permission Defaults</CardTitle>
                  <CardDescription>
                    Default module access for newly created roles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="New Employees See Colleagues' Profiles">
                    <Select defaultValue="yes">
                      <option value="yes">Yes — directory visible</option>
                      <option value="no">No — restricted</option>
                    </Select>
                  </FormField>
                  <FormField label="Public Reports">
                    <Select defaultValue="no">
                      <option value="yes">All employees</option>
                      <option value="no">Managers only</option>
                      <option value="hr">HR only</option>
                    </Select>
                  </FormField>
                </CardContent>
                <CardFooter className="justify-end border-t border-border">
                  <Button>
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose how and when Digital Wave contacts you and your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Leave request submitted", desc: "Notify managers instantly", checked: true },
                  { label: "Leave approved or rejected", desc: "Email the requesting employee", checked: true },
                  { label: "Payroll published", desc: "Notify employees that payslips are ready", checked: true },
                  { label: "Weekly HR digest", desc: "Summary of HR activity every Monday", checked: false },
                  { label: "Attendance anomalies", desc: "Flag late arrivals and missed check-ins", checked: true },
                  { label: "Asset maintenance reminders", desc: "Schedule servicing for company assets", checked: false },
                ].map((n) => (
                  <div
                    key={n.label}
                    className="flex items-center justify-between rounded-[14px] border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Badge variant={n.checked ? "success" : "muted"}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {n.checked ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-between border-t border-border">
                <Button variant="ghost">
                  <Trash2 className="h-4 w-4" /> Reset All
                </Button>
                <Button>
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}