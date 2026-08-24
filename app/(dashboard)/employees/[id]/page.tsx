"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Mail,
  Phone,
  Cake,
  MapPin,
  Wallet,
  Briefcase,
  Building2,
  Pencil,
  Users,
  IdCard,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeFormDialog } from "../employee-form-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "PROBATION";
type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "TERMINATED";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "LEAVE";

interface EmployeeDetail {
  id: string;
  employeeId: string;
  departmentId: string;
  positionId: string;
  photo?: string | null;
  nationalId?: string | null;
  passportNo?: string | null;
  address?: string | null;
  birthDate?: string | null;
  gender: string;
  joiningDate: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  salary: number | string;
  bankName?: string | null;
  bankAccount?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  department: { name: string } | null;
  position: { title: string } | null;
  manager:
    | { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
  user: { email: string | null; firstName: string; lastName: string; avatarUrl?: string | null } | null;
  leaves: { status: LeaveStatus }[];
  attended: { status: AttendanceStatus; date: string }[];
  payrolls: { periodMonth: number; periodYear: number; netPay: number | string }[];
}

const employmentTypeLabel: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERN: "Intern",
  PROBATION: "Probation",
};

const statusLabel: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On Leave",
  TERMINATED: "Terminated",
};

const statusVariant: Record<EmployeeStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  TERMINATED: "danger",
};

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<EmployeeDetail>(`/employees/${id}`);
        if (cancelled) return;
        setEmployee(res);
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
  }, [id, refreshKey]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
        <Skeleton className="h-28 w-full rounded-[20px]" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-[20px]" />
          <Skeleton className="h-64 rounded-[20px]" />
          <Skeleton className="h-64 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <EmptyState
          title="Unable to load employee"
          description="Check that the backend API is reachable and you are signed in."
        />
      </div>
    );
  }

  const fullName = employee.user
    ? `${employee.user.firstName} ${employee.user.lastName}`.trim()
    : employee.employeeId;
  const managerName = employee.manager?.user
    ? `${employee.manager.user.firstName} ${employee.manager.user.lastName}`
    : employee.manager?.employeeId ?? "—";
  const salary = formatCurrency(Number(employee.salary ?? 0));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRecords = employee.attended.filter((a) => new Date(a.date) >= monthStart);
  const presentCount = monthRecords.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const attendancePct =
    monthRecords.length > 0 ? Math.round((presentCount / monthRecords.length) * 100) : 0;

  const pendingLeaves = employee.leaves.filter((l) => l.status === "PENDING").length;
  const yearsWithCompany = Math.max(
    0,
    (Date.now() - new Date(employee.joiningDate).getTime()) / (365.25 * 24 * 3600 * 1000)
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Employee Profile"
        description={employee.employeeId}
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        }
      />

      {/* Profile header card */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar name={fullName} size="xl" src={employee.user?.avatarUrl ?? employee.photo} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <Badge variant={statusVariant[employee.status]}>{statusLabel[employee.status]}</Badge>
              <span className="text-sm text-muted-foreground">{employee.employeeId}</span>
            </div>
            <p className="mt-1 text-muted-foreground">
              {employee.position?.title ?? "—"} • {employee.department?.name ?? "—"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {employee.user?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {employee.user.email}
                </span>
              )}
              {employee.emergencyContactPhone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {employee.emergencyContactPhone}
                </span>
              )}
              {employee.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {employee.address}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Employment details */}
        <Card>
          <CardHeader>
            <CardTitle>Employment</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <Field icon={<Building2 className="h-4 w-4" />} label="Department" value={employee.department?.name ?? "—"} />
              <Field icon={<Briefcase className="h-4 w-4" />} label="Position" value={employee.position?.title ?? "—"} />
              <Field icon={<Cake className="h-4 w-4" />} label="Joined" value={formatDate(employee.joiningDate)} />
              <Field icon={<Wallet className="h-4 w-4" />} label="Salary" value={`${salary} / month`} />
              <Field icon={<Users className="h-4 w-4" />} label="Manager" value={managerName} />
              <Field icon={<Briefcase className="h-4 w-4" />} label="Employment Type" value={employmentTypeLabel[employee.employmentType] ?? employee.employmentType} />
            </dl>
          </CardContent>
        </Card>

        {/* Personal details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <Field icon={<Mail className="h-4 w-4" />} label="Email" value={employee.user?.email ?? "—"} />
              <Field icon={<Phone className="h-4 w-4" />} label="Mobile" value={employee.emergencyContactPhone ?? "—"} />
              <Field icon={<Cake className="h-4 w-4" />} label="Birth Date" value={employee.birthDate ? formatDate(employee.birthDate) : "—"} />
              <Field icon={<MapPin className="h-4 w-4" />} label="Address" value={employee.address ?? "—"} />
              <Field icon={<IdCard className="h-4 w-4" />} label="National ID" value={employee.nationalId ?? "—"} />
              <Field icon={<IdCard className="h-4 w-4" />} label="Passport" value={employee.passportNo ?? "—"} />
              <Field icon={<Users className="h-4 w-4" />} label="Emergency Contact" value={[employee.emergencyContactName, employee.emergencyContactPhone].filter(Boolean).join(" · ") || "—"} />
            </dl>
          </CardContent>
        </Card>

        {/* Quick summary */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <SummaryRow label="Attendance (month)" value={`${attendancePct}%`} icon="△" tone="success" />
              <SummaryRow label="Pending Leaves" value={String(pendingLeaves)} icon="▤" tone="warning" />
              <SummaryRow label="Payroll Records" value={String(employee.payrolls.length)} icon="★" tone="info" />
              <SummaryRow label="Years with company" value={yearsWithCompany.toFixed(1)} icon="◎" tone="muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      <EmployeeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={employee}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "success" | "warning" | "info" | "muted";
}) {
  const tones = {
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    muted: "text-muted-foreground",
  };
  return (
    <div className="flex items-center justify-between">
      <span className={`flex items-center gap-2 text-sm text-muted-foreground ${tones[tone]}`}>
        {icon} {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
