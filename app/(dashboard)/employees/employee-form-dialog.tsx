"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface EmployeeFormValues {
  employeeId: string;
  gender: string;
  departmentId: string;
  positionId: string;
  joiningDate: string;
  salary: string;
  birthDate?: string;
  nationalId?: string;
  passportNo?: string;
  address?: string;
  employmentType?: string;
  status?: string;
  bankName?: string;
  bankAccount?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

interface Option {
  id: string;
  name: string;
}

interface EditingEmployee {
  id: string;
  employeeId: string;
  gender: string;
  departmentId: string;
  positionId: string;
  joiningDate: string;
  salary: number | string;
  status: string;
  employmentType?: string | null;
  birthDate?: string | null;
  nationalId?: string | null;
  passportNo?: string | null;
  address?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
}

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  editing?: EditingEmployee | null;
}

const emptyForm: EmployeeFormValues = {
  employeeId: "",
  gender: "MALE",
  departmentId: "",
  positionId: "",
  joiningDate: "",
  salary: "",
  employmentType: "FULL_TIME",
  status: "ACTIVE",
};

export function EmployeeFormDialog({ open, onOpenChange, onSaved, editing }: EmployeeFormDialogProps) {
  const [form, setForm] = React.useState<EmployeeFormValues>(emptyForm);
  const [departments, setDepartments] = React.useState<Option[]>([]);
  const [positions, setPositions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadOptions = React.useCallback(async () => {
    try {
      const { api } = await import("@/lib/api");
      const [depts, positionsRes] = await Promise.all([
        api.get<{ id: string; name: string }[]>("/departments"),
        api.get<{ id: string; title: string }[]>("/positions"),
      ]);
      setDepartments(depts.map((d) => ({ id: d.id, name: d.name })));
      setPositions(positionsRes.map((p) => ({ id: p.id, name: p.title })));
    } catch {
      /* options are non-critical */
    }
  }, []);

  React.useEffect(() => {
    if (open) loadOptions();
  }, [open, loadOptions]);

  React.useEffect(() => {
    if (editing) {
      setForm({
        employeeId: editing.employeeId,
        gender: editing.gender,
        departmentId: editing.departmentId,
        positionId: editing.positionId,
        joiningDate: editing.joiningDate,
        salary: String(editing.salary ?? ""),
        birthDate: editing.birthDate ?? "",
        nationalId: editing.nationalId ?? "",
        passportNo: editing.passportNo ?? "",
        address: editing.address ?? "",
        employmentType: editing.employmentType ?? "FULL_TIME",
        status: editing.status ?? "ACTIVE",
        bankName: editing.bankName ?? "",
        bankAccount: editing.bankAccount ?? "",
        emergencyContactName: editing.emergencyContactName ?? "",
        emergencyContactPhone: editing.emergencyContactPhone ?? "",
        notes: editing.notes ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [editing, open]);

  const update = <K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.employeeId.trim() || !form.departmentId || !form.positionId || !form.joiningDate || !form.salary) {
      setError("Employee ID, department, position, joining date, and salary are required.");
      return;
    }

    const payload = {
      employeeId: form.employeeId.trim(),
      gender: form.gender,
      departmentId: form.departmentId,
      positionId: form.positionId,
      joiningDate: form.joiningDate,
      salary: Number(form.salary),
      birthDate: form.birthDate || undefined,
      nationalId: form.nationalId || undefined,
      passportNo: form.passportNo || undefined,
      address: form.address || undefined,
      employmentType: form.employmentType || undefined,
      status: form.status || undefined,
      bankName: form.bankName || undefined,
      bankAccount: form.bankAccount || undefined,
      emergencyContactName: form.emergencyContactName || undefined,
      emergencyContactPhone: form.emergencyContactPhone || undefined,
      notes: form.notes || undefined,
    };

    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      if (editing) {
        await api.put(`/employees/${editing.id}`, payload);
        toast.success("Employee updated");
      } else {
        await api.post("/employees", payload);
        toast.success("Employee created");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
        <DialogDescription>
          {editing ? "Update the employee's employment record." : "Create a new employee employment record."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-5">
            {error && <div className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee Code *</Label>
                <Input
                  id="employeeId"
                  placeholder="e.g. DW-0010"
                  value={form.employeeId}
                  onChange={(e) => update("employeeId", e.target.value)}
                  disabled={!!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select id="gender" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department *</Label>
                <Select
                  id="departmentId"
                  value={form.departmentId}
                  onChange={(e) => update("departmentId", e.target.value)}
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionId">Position *</Label>
                <Select id="positionId" value={form.positionId} onChange={(e) => update("positionId", e.target.value)}>
                  <option value="">Select position</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => update("joiningDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary *</Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.salary}
                  onChange={(e) => update("salary", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  id="employmentType"
                  value={form.employmentType}
                  onChange={(e) => update("employmentType", e.target.value)}
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                  <option value="PROBATION">Probation</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={(e) => update("status", e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="TERMINATED">Terminated</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input id="nationalId" value={form.nationalId} onChange={(e) => update("nationalId", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Input id="bankAccount" value={form.bankAccount} onChange={(e) => update("bankAccount", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact</Label>
                <Input
                  id="emergencyContactName"
                  value={form.emergencyContactName}
                  onChange={(e) => update("emergencyContactName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={(e) => update("emergencyContactPhone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editing ? "Save Changes" : "Create Employee"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
