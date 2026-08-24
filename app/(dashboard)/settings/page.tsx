"use client";

import * as React from "react";
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
  CheckCircle2,
  Sparkles,
  PlugZap,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  | "notifications"
  | "ai";

const sections: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: "company", label: "Company Settings", icon: <Building2 className="h-4 w-4" /> },
  { id: "working-days", label: "Working Days", icon: <CalendarClock className="h-4 w-4" /> },
  { id: "leave", label: "Leave Policies", icon: <ScrollText className="h-4 w-4" /> },
  { id: "payroll", label: "Payroll Settings", icon: <Wallet className="h-4 w-4" /> },
  { id: "templates", label: "Email Templates", icon: <Mail className="h-4 w-4" /> },
  { id: "branding", label: "Branding", icon: <Palette className="h-4 w-4" /> },
  { id: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "ai", label: "AI Assistant", icon: <Sparkles className="h-4 w-4" /> },
];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Administrator",
  HR: "HR Manager",
  MANAGER: "Team Lead",
  FINANCE: "Finance",
  RECRUITER: "Recruiter",
  EMPLOYEE: "Employee",
};

const ROLE_PERMISSIONS: Record<string, string> = {
  SUPER_ADMIN: "Full access to all modules and settings",
  HR: "Employees, payroll, leave, recruitment",
  MANAGER: "Team directory, approvals, timesheets",
  FINANCE: "Payroll, reports, expenses",
  RECRUITER: "Job posts, candidates, interviews",
  EMPLOYEE: "Self-service: profile, leave, payslips",
};

const roleVariant: Record<string, "default" | "info" | "warning" | "secondary" | "success"> = {
  Administrator: "default",
  "HR Manager": "info",
  "Team Lead": "warning",
  Finance: "success",
  Recruiter: "secondary",
  Employee: "secondary",
};

interface RoleRow {
  name: string;
  members: number;
  permissions: string;
}

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
  saving,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</CardContent>
      {onSave && (
        <CardFooter className="justify-end border-t border-border">
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

const COMPANY_KEYS = ["companyName", "legalEntity", "taxId", "country", "timezone", "currency", "address", "website"];
const WORKING_KEYS = ["workingDays", "workWeekStart", "workStartTime", "workEndTime", "weeklyHours", "breakDuration"];
const LEAVE_KEYS = ["annualLeave", "accrualModel", "carryoverLimit", "approvalWorkflow", "sickLeave", "maternityLeave", "paternityLeave", "holidayCalendar"];
const PAYROLL_KEYS = ["payCycle", "paymentDay", "overtimeRate", "pensionRate", "healthPremium", "payrollApproval"];
const BRANDING_KEYS = ["brandColor", "theme", "tagline"];

export default function SettingsPage() {
  const [active, setActive] = React.useState<SectionId>("company");
  const [settings, setSettings] = React.useState<Record<string, any>>({});
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [roles, setRoles] = React.useState<RoleRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [savingSection, setSavingSection] = React.useState<SectionId | null>(null);
  const [ai, setAi] = React.useState<Record<string, unknown> | null>(null);
  const [aiForm, setAiForm] = React.useState<Record<string, string>>({});
  const [aiEnabled, setAiEnabled] = React.useState(false);
  const [aiWriteEnabled, setAiWriteEnabled] = React.useState(false);
  const [aiKey, setAiKey] = React.useState("");
  const [aiSaving, setAiSaving] = React.useState(false);
  const [aiTesting, setAiTesting] = React.useState(false);
  const [aiTestResult, setAiTestResult] = React.useState<{ ok: boolean; model: string; latencyMs: number; error?: string } | null>(null);
  const [users, setUsers] = React.useState<{ id: string; email: string; firstName: string; lastName: string; role: string; isActive: boolean; emailVerifiedAt?: string | null }[]>([]);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteForm, setInviteForm] = React.useState({ email: "", firstName: "", lastName: "", role: "EMPLOYEE" });
  const [inviting, setInviting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const [settingsRes, usersRes] = await Promise.all([
          api.get<Record<string, any>>("/settings"),
          api.get<{ id: string; role: string; email: string; firstName: string; lastName: string; isActive: boolean; emailVerifiedAt?: string | null }[]>("/users"),
        ]);
        if (cancelled) return;
        setSettings(settingsRes);
        setUsers(usersRes);

        const counts = new Map<string, number>();
        for (const u of usersRes) {
          counts.set(u.role, (counts.get(u.role) ?? 0) + 1);
        }
        const roleOrder = ["SUPER_ADMIN", "HR", "MANAGER", "FINANCE", "RECRUITER", "EMPLOYEE"];
        setRoles(
          roleOrder
            .filter((r) => counts.has(r))
            .map((r) => ({
              name: ROLE_LABELS[r] ?? r,
              members: counts.get(r) ?? 0,
              permissions: ROLE_PERMISSIONS[r] ?? "—",
            }))
        );

        const initial: Record<string, string> = {};
        const allKeys = [...COMPANY_KEYS, ...WORKING_KEYS, ...LEAVE_KEYS, ...PAYROLL_KEYS, ...BRANDING_KEYS];
        for (const key of allKeys) {
          const v = settingsRes[key];
          initial[key] = v === null || v === undefined ? "" : String(v);
        }
        setForm(initial);
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

  const saveSection = async (section: SectionId, keys: string[], fallbacks: Record<string, string>) => {
    const payload: Record<string, any> = {};
    for (const key of keys) {
      payload[key] = form[key] !== undefined && form[key] !== "" ? form[key] : fallbacks[key] ?? form[key];
    }
    setSavingSection(section);
    try {
      const { api } = await import("@/lib/api");
      await api.put("/settings", payload);
      setSettings((prev) => ({ ...prev, ...payload }));
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSavingSection(null);
    }
  };

  const companyFallbacks = {
    companyName: "Digital Wave Inc.",
    legalEntity: "Digital Wave Holdings LLC",
    taxId: "",
    country: "US",
    timezone: "est",
    currency: "usd",
    address: "",
    website: "",
  };

  const setField = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  React.useEffect(() => {
    if (active !== "ai" || ai) return;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const s = await api.get<Record<string, unknown>>("/ai/settings");
        setAi(s);
        setAiEnabled(Boolean(s.enabled));
        setAiWriteEnabled(Boolean(s.writeActionsEnabled));
        setAiForm({
          provider: String(s.provider ?? "openai-compatible"),
          baseUrl: String(s.baseUrl ?? ""),
          model: String(s.model ?? ""),
          temperature: String(s.temperature ?? 0.2),
          maxOutputTokens: String(s.maxOutputTokens ?? 1024),
          requestTimeoutMs: String(s.requestTimeoutMs ?? 60000),
          monthlyTokenLimit: String(s.monthlyTokenLimit ?? 1000000),
          perUserMonthlyTokenLimit: String(s.perUserMonthlyTokenLimit ?? 100000),
          allowedRoles: String(s.allowedRoles ?? ""),
        });
      } catch {
        setAi({ denied: true });
      }
    })();
  }, [active, ai]);

  const saveAiSettings = async () => {
    setAiSaving(true);
    try {
      const { api } = await import("@/lib/api");
      const s = await api.put<Record<string, unknown>>("/ai/settings", {
        enabled: aiEnabled,
        writeActionsEnabled: aiWriteEnabled,
        provider: aiForm.provider,
        baseUrl: aiForm.baseUrl || undefined,
        model: aiForm.model,
        temperature: Number(aiForm.temperature) || 0.2,
        maxOutputTokens: Number(aiForm.maxOutputTokens) || 1024,
        requestTimeoutMs: Number(aiForm.requestTimeoutMs) || 60000,
        monthlyTokenLimit: Number(aiForm.monthlyTokenLimit) || 1000000,
        perUserMonthlyTokenLimit: Number(aiForm.perUserMonthlyTokenLimit) || 100000,
        allowedRoles: aiForm.allowedRoles,
        ...(aiKey ? { apiKey: aiKey } : {}),
      });
      setAi(s);
      setAiKey("");
      toast.success("AI Assistant settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save AI settings");
    } finally {
      setAiSaving(false);
    }
  };

  const testAiConnection = async () => {
    setAiTesting(true);
    setAiTestResult(null);
    try {
      const { api } = await import("@/lib/api");
      const res = await api.post<{ ok: boolean; model: string; latencyMs: number; error?: string }>(
        "/ai/settings/test",
        {
          baseUrl: aiForm.baseUrl || undefined,
          model: aiForm.model || undefined,
          ...(aiKey ? { apiKey: aiKey } : {}),
        }
      );
      setAiTestResult(res);
    } catch (err) {
      setAiTestResult({ ok: false, model: "", latencyMs: 0, error: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setAiTesting(false);
    }
  };

  const removeAiKey = async () => {
    try {
      const { api } = await import("@/lib/api");
      const s = await api.del<Record<string, unknown>>("/ai/settings/api-key");
      setAi(s);
      setAiKey("");
      toast.success("API key removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove key");
    }
  };

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const { api } = await import("@/lib/api");
      const res = await api.post<{ emailed: boolean; devInviteLink?: string }>("/users/invite", inviteForm);
      if (res.devInviteLink) {
        toast.info("Email unavailable in dev — invite link copied to console");
        console.log("Invite link:", res.devInviteLink);
      } else if (res.emailed) {
        toast.success(`Invitation sent to ${inviteForm.email}`);
      } else {
        toast.warning("User created but the email could not be sent. Check the Resend configuration.");
      }
      setInviteOpen(false);
      setInviteForm({ email: "", firstName: "", lastName: "", role: "EMPLOYEE" });
      const { api: api2 } = await import("@/lib/api");
      setUsers(await api2.get<typeof users>("/users"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  };

  const roleColumns: ColumnDef<RoleRow>[] = [
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
              onSave={() => saveSection("company", COMPANY_KEYS, companyFallbacks)}
              saving={savingSection === "company"}
            >
              <FormField label="Company Name">
                <Input value={form.companyName ?? ""} onChange={(e) => setField("companyName", e.target.value)} placeholder="Digital Wave Inc." />
              </FormField>
              <FormField label="Legal Entity">
                <Input value={form.legalEntity ?? ""} onChange={(e) => setField("legalEntity", e.target.value)} placeholder="Digital Wave Holdings LLC" />
              </FormField>
              <FormField label="Tax ID / Registration Number">
                <Input value={form.taxId ?? ""} onChange={(e) => setField("taxId", e.target.value)} placeholder="DW-8842-1930" />
              </FormField>
              <FormField label="Country">
                <Select value={form.country ?? "US"} onChange={(e) => setField("country", e.target.value)}>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="IN">India</option>
                </Select>
              </FormField>
              <FormField label="Timezone">
                <Select value={form.timezone ?? "est"} onChange={(e) => setField("timezone", e.target.value)}>
                  <option value="est">(GMT-5) Eastern Time</option>
                  <option value="pst">(GMT-8) Pacific Time</option>
                  <option value="gmt">(GMT+0) Greenwich Mean Time</option>
                  <option value="gst">(GMT+4) Gulf Standard Time</option>
                </Select>
              </FormField>
              <FormField label="Default Currency">
                <Select value={form.currency ?? "usd"} onChange={(e) => setField("currency", e.target.value)}>
                  <option value="usd">USD — US Dollar</option>
                  <option value="eur">EUR — Euro</option>
                  <option value="aed">AED — UAE Dirham</option>
                  <option value="inr">INR — Indian Rupee</option>
                </Select>
              </FormField>
              <FormField label="Head Office Address" hint="Used on official documents and contracts.">
                <Textarea
                  rows={3}
                  value={form.address ?? ""}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="1201 Innovation Drive, Suite 400, Austin, TX 78701"
                />
              </FormField>
              <FormField label="Company Website">
                <Input value={form.website ?? ""} onChange={(e) => setField("website", e.target.value)} placeholder="https://..." />
              </FormField>
            </SectionCard>
          )}

          {active === "working-days" && (
            <SectionCard
              title="Working Days"
              description="Define the standard workweek and office hours."
              onSave={() => saveSection("working-days", WORKING_KEYS, {})}
              saving={savingSection === "working-days"}
            >
              <FormField label="Weekly Working Days">
                <Select value={form.workingDays ?? "5"} onChange={(e) => setField("workingDays", e.target.value)}>
                  <option value="5">Monday — Friday</option>
                  <option value="6">Monday — Saturday</option>
                  <option value="4">Monday — Thursday</option>
                </Select>
              </FormField>
              <FormField label="Start of Work Week">
                <Select value={form.workWeekStart ?? "mon"} onChange={(e) => setField("workWeekStart", e.target.value)}>
                  <option value="mon">Monday</option>
                  <option value="sun">Sunday</option>
                  <option value="sat">Saturday</option>
                </Select>
              </FormField>
              <FormField label="Standard Start Time">
                <Select value={form.workStartTime ?? "9"} onChange={(e) => setField("workStartTime", e.target.value)}>
                  <option value="8">8:00 AM</option>
                  <option value="9">9:00 AM</option>
                  <option value="10">10:00 AM</option>
                </Select>
              </FormField>
              <FormField label="Standard End Time">
                <Select value={form.workEndTime ?? "6"} onChange={(e) => setField("workEndTime", e.target.value)}>
                  <option value="5">5:00 PM</option>
                  <option value="6">6:00 PM</option>
                  <option value="7">7:00 PM</option>
                </Select>
              </FormField>
              <FormField label="Weekly Hours Cap" hint="Overtime is calculated beyond this limit.">
                <Input type="number" value={form.weeklyHours ?? ""} onChange={(e) => setField("weeklyHours", e.target.value)} placeholder="40" />
              </FormField>
              <FormField label="Break Duration">
                <Select value={form.breakDuration ?? "60"} onChange={(e) => setField("breakDuration", e.target.value)}>
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
              onSave={() => saveSection("leave", LEAVE_KEYS, {})}
              saving={savingSection === "leave"}
            >
              <FormField label="Default Annual Leave (days)">
                <Input type="number" value={form.annualLeave ?? ""} onChange={(e) => setField("annualLeave", e.target.value)} placeholder="24" />
              </FormField>
              <FormField label="Accrual Model">
                <Select value={form.accrualModel ?? "monthly"} onChange={(e) => setField("accrualModel", e.target.value)}>
                  <option value="monthly">Monthly accrual</option>
                  <option value="annual">Annual lump sum</option>
                  <option value="lump">At joining</option>
                </Select>
              </FormField>
              <FormField label="Carryover Limit" hint="Unused days that roll over to next year.">
                <Input type="number" value={form.carryoverLimit ?? ""} onChange={(e) => setField("carryoverLimit", e.target.value)} placeholder="10" />
              </FormField>
              <FormField label="Approval Workflow">
                <Select value={form.approvalWorkflow ?? "manager"} onChange={(e) => setField("approvalWorkflow", e.target.value)}>
                  <option value="manager">Direct manager</option>
                  <option value="hr">HR department</option>
                  <option value="both">Manager + HR</option>
                </Select>
              </FormField>
              <FormField label="Sick Leave Entitlement">
                <Input type="number" value={form.sickLeave ?? ""} onChange={(e) => setField("sickLeave", e.target.value)} placeholder="12" />
              </FormField>
              <FormField label="Maternity Leave (weeks)">
                <Input type="number" value={form.maternityLeave ?? ""} onChange={(e) => setField("maternityLeave", e.target.value)} placeholder="16" />
              </FormField>
              <FormField label="Paternity Leave (weeks)">
                <Input type="number" value={form.paternityLeave ?? ""} onChange={(e) => setField("paternityLeave", e.target.value)} placeholder="2" />
              </FormField>
              <FormField label="Holiday Calendar">
                <Select value={form.holidayCalendar ?? "us"} onChange={(e) => setField("holidayCalendar", e.target.value)}>
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
              onSave={() => saveSection("payroll", PAYROLL_KEYS, {})}
              saving={savingSection === "payroll"}
            >
              <FormField label="Pay Cycle">
                <Select value={form.payCycle ?? "monthly"} onChange={(e) => setField("payCycle", e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </FormField>
              <FormField label="Payment Day">
                <Select value={form.paymentDay ?? "1"} onChange={(e) => setField("paymentDay", e.target.value)}>
                  <option value="1">1st of the month</option>
                  <option value="25">25th of the month</option>
                  <option value="last">Last working day</option>
                </Select>
              </FormField>
              <FormField label="Overtime Rate">
                <Select value={form.overtimeRate ?? "1.5"} onChange={(e) => setField("overtimeRate", e.target.value)}>
                  <option value="1.5">1.5x — time and a half</option>
                  <option value="2">2x — double time</option>
                  <option value="1">1x — standard</option>
                </Select>
              </FormField>
              <FormField label="Pension / Retirement Contribution (%)">
                <Input type="number" value={form.pensionRate ?? ""} onChange={(e) => setField("pensionRate", e.target.value)} placeholder="6" />
              </FormField>
              <FormField label="Employer Health Premium (%)">
                <Input type="number" value={form.healthPremium ?? ""} onChange={(e) => setField("healthPremium", e.target.value)} placeholder="4" />
              </FormField>
              <FormField label="Payroll Approval">
                <Select value={form.payrollApproval ?? "hr"} onChange={(e) => setField("payrollApproval", e.target.value)}>
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
                  Templates are sent automatically at key lifecycle events.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Welcome Onboarding", desc: "Sent to new hires on their start date" },
                  { name: "Leave Approved", desc: "Sent when a leave request is approved" },
                  { name: "Leave Rejected", desc: "Sent when a leave request is rejected" },
                  { name: "Payslip Ready", desc: "Sent when a payslip is published" },
                  { name: "Password Reset", desc: "Sent with a one-time code to reset a password" },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between rounded-[14px] border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "branding" && (
            <SectionCard
              title="Branding"
              description="Customize the look and feel of the employee portal."
              onSave={() => saveSection("branding", BRANDING_KEYS, {})}
              saving={savingSection === "branding"}
            >
              <FormField label="Primary Brand Color">
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 shrink-0 rounded-[12px] border border-border"
                    style={{ backgroundColor: form.brandColor || "#0B5FFF" }}
                  />
                  <Input value={form.brandColor ?? "#0B5FFF"} onChange={(e) => setField("brandColor", e.target.value)} className="font-mono" />
                </div>
              </FormField>
              <FormField label="Theme">
                <Select value={form.theme ?? "light"} onChange={(e) => setField("theme", e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">Follow system</option>
                </Select>
              </FormField>
              <FormField label="Company Tagline">
                <Input value={form.tagline ?? ""} onChange={(e) => setField("tagline", e.target.value)} placeholder="Work made simple" />
              </FormField>
            </SectionCard>
          )}

          {active === "permissions" && (
            <Card>
              <CardHeader>
                <CardTitle>Roles &amp; Permissions</CardTitle>
                <CardDescription>
                  Live count of members per role and their module access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <DataTable
                  columns={roleColumns}
                  data={roles}
                  pagination={false}
                  toolbar={
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{roles.length} roles · {roles.reduce((a, r) => a + r.members, 0)} users</p>
                      <Button size="sm" onClick={() => setInviteOpen(true)}>
                        <UserPlus className="h-4 w-4" /> Invite User
                      </Button>
                    </div>
                  }
                />

                <div>
                  <p className="mb-2 text-sm font-medium">Users</p>
                  <div className="overflow-hidden rounded-[14px] border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Email</th>
                          <th className="px-4 py-2.5">Role</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-2.5 font-medium">{u.firstName} {u.lastName}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                            <td className="px-4 py-2.5">{u.role.replaceAll("_", " ")}</td>
                            <td className="px-4 py-2.5">
                              {u.emailVerifiedAt ? (
                                <Badge variant="success">Active</Badge>
                              ) : (
                                <Badge variant="warning">Invitation pending</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                        {!users.length && (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "ai" && (
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Configure the provider used by the in-app AI Assistant. The API key is encrypted at
                  rest and never returned to the browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {ai?.denied ? (
                  <p className="text-sm text-muted-foreground">
                    Only administrators can configure the AI Assistant.
                  </p>
                ) : !ai ? (
                  <p className="text-sm text-muted-foreground">Loading AI settings...</p>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 rounded-[14px] border border-border p-4">
                      <label className="flex items-center justify-between text-sm font-medium">
                        Enable AI Assistant
                        <input
                          type="checkbox"
                          checked={aiEnabled}
                          onChange={(e) => setAiEnabled(e.target.checked)}
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        Write actions (coming after tenant-isolation verification)
                        <input
                          type="checkbox"
                          checked={aiWriteEnabled}
                          disabled
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Credential source: {String(ai.credentialSource ?? "none")}
                        {ai.apiKeyMasked ? ` · key ${String(ai.apiKeyMasked)}` : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField label="Provider">
                        <Select
                          value={aiForm.provider}
                          onChange={(e) => setAiForm((f) => ({ ...f, provider: e.target.value }))}
                        >
                          <option value="openai-compatible">OpenAI-compatible (OpenAI, Azure, OpenRouter...)</option>
                        </Select>
                      </FormField>
                      <FormField label="API Base URL">
                        <Input
                          value={aiForm.baseUrl}
                          onChange={(e) => setAiForm((f) => ({ ...f, baseUrl: e.target.value }))}
                          placeholder="https://openrouter.ai/api/v1"
                        />
                      </FormField>
                      <FormField label="API Key" hint={ai.hasApiKey ? `A key is stored (${String(ai.apiKeyMasked)}). Enter a new one to replace it.` : "Never displayed after saving."}>
                        <Input
                          type="password"
                          value={aiKey}
                          onChange={(e) => setAiKey(e.target.value)}
                          placeholder="sk-..."
                          autoComplete="off"
                        />
                      </FormField>
                      <FormField label="Model">
                        <Input
                          value={aiForm.model}
                          onChange={(e) => setAiForm((f) => ({ ...f, model: e.target.value }))}
                          placeholder="openai/gpt-4o-mini"
                        />
                      </FormField>
                      <FormField label="Temperature">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={aiForm.temperature}
                          onChange={(e) => setAiForm((f) => ({ ...f, temperature: e.target.value }))}
                        />
                      </FormField>
                      <FormField label="Max Output Tokens">
                        <Input
                          type="number"
                          value={aiForm.maxOutputTokens}
                          onChange={(e) => setAiForm((f) => ({ ...f, maxOutputTokens: e.target.value }))}
                        />
                      </FormField>
                      <FormField label="Request Timeout (ms)">
                        <Input
                          type="number"
                          value={aiForm.requestTimeoutMs}
                          onChange={(e) => setAiForm((f) => ({ ...f, requestTimeoutMs: e.target.value }))}
                        />
                      </FormField>
                      <FormField label="Allowed Roles" hint="Comma-separated role codes.">
                        <Input
                          value={aiForm.allowedRoles}
                          onChange={(e) => setAiForm((f) => ({ ...f, allowedRoles: e.target.value }))}
                          placeholder="SUPER_ADMIN,HR,MANAGER,FINANCE,RECRUITER,EMPLOYEE"
                        />
                      </FormField>
                      <FormField label="Monthly Token Limit (organization)">
                        <Input
                          type="number"
                          value={aiForm.monthlyTokenLimit}
                          onChange={(e) => setAiForm((f) => ({ ...f, monthlyTokenLimit: e.target.value }))}
                        />
                      </FormField>
                      <FormField label="Monthly Token Limit (per user)">
                        <Input
                          type="number"
                          value={aiForm.perUserMonthlyTokenLimit}
                          onChange={(e) => setAiForm((f) => ({ ...f, perUserMonthlyTokenLimit: e.target.value }))}
                        />
                      </FormField>
                    </div>

                    {aiTestResult && (
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-[12px] px-4 py-3 text-sm",
                          aiTestResult.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {aiTestResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <PlugZap className="h-4 w-4" />}
                        {aiTestResult.ok
                          ? `Connection succeeded · ${aiTestResult.model} · ${aiTestResult.latencyMs}ms`
                          : `Connection failed: ${aiTestResult.error ?? "unknown error"}`}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                      <Button onClick={saveAiSettings} disabled={aiSaving}>
                        <Save className="h-4 w-4" /> {aiSaving ? "Saving..." : "Save Configuration"}
                      </Button>
                      <Button variant="outline" onClick={testAiConnection} disabled={aiTesting}>
                        <PlugZap className="h-4 w-4" /> {aiTesting ? "Testing..." : "Test Connection"}
                      </Button>
                      {Boolean(ai.hasApiKey) && ai.credentialSource === "database" && (
                        <Button variant="outline" onClick={removeAiKey} className="text-destructive">
                          <Trash2 className="h-4 w-4" /> Remove API Key
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Notification events are sent as they occur in the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Leave request submitted", desc: "Notify managers instantly", checked: true },
                  { label: "Leave approved or rejected", desc: "Email the requesting employee", checked: true },
                  { label: "Payroll published", desc: "Notify employees that payslips are ready", checked: true },
                  { label: "Password reset", desc: "Email a one-time code to reset a password", checked: true },
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
            </Card>
          )}
          </>
          )}
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              An invitation email with an activation link will be sent. The link expires in 7 days.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitInvite}>
            <FormField label="First Name">
              <Input
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm((f) => ({ ...f, firstName: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Last Name">
              <Input
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm((f) => ({ ...f, lastName: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Work Email">
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Role">
              <Select
                value={inviteForm.role}
                onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="RECRUITER">Recruiter</option>
                <option value="FINANCE">Finance</option>
                <option value="HR">HR Manager</option>
                <option value="SUPER_ADMIN">Administrator</option>
              </Select>
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting}>
                <UserPlus className="h-4 w-4" /> {inviting ? "Sending..." : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}