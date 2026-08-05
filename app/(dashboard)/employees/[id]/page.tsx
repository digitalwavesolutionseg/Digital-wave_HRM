import {
  Mail,
  Phone,
  Cake,
  MapPin,
  Wallet,
  Briefcase,
  Building2,
  Pencil,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Employee Profile"
        description={`Details for ${id}`}
        actions={
          <>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </>
        }
      />

      {/* Profile header card */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar name="Ahmed Nasser" size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">Ahmed Nasser</h2>
              <Badge variant="success">Active</Badge>
              <span className="text-sm text-muted-foreground">EMP-1001</span>
            </div>
            <p className="mt-1 text-muted-foreground">Lead Engineer • Engineering</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> ahmed.nasser@digitalwave.solutions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> +20 100 123 4567
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Cairo, Egypt
              </span>
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
              <Field icon={<Building2 className="h-4 w-4" />} label="Department" value="Engineering" />
              <Field icon={<Briefcase className="h-4 w-4" />} label="Position" value="Lead Engineer" />
              <Field icon={<Cake className="h-4 w-4" />} label="Joined" value="March 15, 2021" />
              <Field icon={<Wallet className="h-4 w-4" />} label="Salary" value="$4,200 / month" />
              <Field icon={<Phone className="h-4 w-4" />} label="Manager" value="Dina Mostafa" />
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
              <Field icon={<Mail className="h-4 w-4" />} label="Email" value="ahmed.nasser@digitalwave.solutions" />
              <Field icon={<Phone className="h-4 w-4" />} label="Mobile" value="+20 100 123 4567" />
              <Field icon={<Cake className="h-4 w-4" />} label="Birth Date" value="April 12, 1992" />
              <Field icon={<MapPin className="h-4 w-4" />} label="Address" value="5 Star Street, Maadi, Cairo" />
              <Field icon={<Users className="h-4 w-4" />} label="Emergency Contact" value="N. Hassan +20 111 222 3333" />
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
              <SummaryRow label="Attendance (month)" value="94%" icon="△" tone="success" />
              <SummaryRow label="Pending Leaves" value="2" icon="▤" tone="warning" />
              <SummaryRow label="Completed Reviews" value="3" icon="★" tone="info" />
              <SummaryRow label="Years with company" value="5.4" icon="◎" tone="muted" />
            </div>
          </CardContent>
        </Card>
      </div>
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