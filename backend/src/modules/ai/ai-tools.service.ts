import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ProviderToolSchema } from "./ai-provider.service";

const SALARY_ROLES = ["SUPER_ADMIN", "HR", "FINANCE"];
const HR_ROLES = ["SUPER_ADMIN", "HR", "MANAGER"];
const PAYROLL_ROLES = ["SUPER_ADMIN", "HR", "FINANCE"];

export interface AiUser {
  id: string;
  role: string;
  employee?: { id: string; employeeId: string } | null;
}

interface ToolDefinition {
  schema: ProviderToolSchema;
  execute: (user: AiUser, args: Record<string, unknown>) => Promise<unknown>;
}

const employeeSelect = (includeSalary: boolean) => ({
  id: true,
  employeeId: true,
  status: true,
  employmentType: true,
  joiningDate: true,
  ...(includeSalary ? { salary: true, bankName: true, bankAccount: true } : {}),
  department: { select: { name: true } },
  position: { select: { title: true } },
  manager: { select: { employeeId: true, user: { select: { firstName: true, lastName: true } } } },
  user: { select: { firstName: true, lastName: true, email: true } },
});

type EmployeeRow = {
  id: string;
  employeeId: string;
  status: string;
  employmentType: string;
  joiningDate: Date;
  salary?: unknown;
  bankName?: unknown;
  bankAccount?: unknown;
  department: { name: string } | null;
  position: { title: string } | null;
  manager: { employeeId: string; user: { firstName: string; lastName: string } | null } | null;
  user: { firstName: string; lastName: string; email: string } | null;
  leaves?: { id: string }[];
};

function presentEmployee(row: EmployeeRow, includeSalary: boolean) {
  return {
    employeeId: row.employeeId,
    name: row.user ? `${row.user.firstName} ${row.user.lastName}`.trim() : "—",
    email: row.user?.email ?? null,
    department: row.department?.name ?? null,
    position: row.position?.title ?? null,
    status: row.status,
    employmentType: row.employmentType,
    joiningDate: row.joiningDate,
    manager: row.manager?.user
      ? `${row.manager.user.firstName} ${row.manager.user.lastName}`.trim()
      : row.manager?.employeeId ?? null,
    ...(includeSalary
      ? {
          salary: row.salary !== undefined ? Number(row.salary) : undefined,
          bankName: row.bankName ?? undefined,
          bankAccount: row.bankAccount ? `****${String(row.bankAccount).slice(-4)}` : undefined,
        }
      : {}),
  };
}

@Injectable()
export class AiToolsService {
  constructor(private prisma: PrismaService) {}

  private readonly tools: Record<string, ToolDefinition> = {
    search_employees: {
      schema: {
        type: "function",
        function: {
          name: "search_employees",
          description:
            "Search employees by name, email or employee number. Optionally filter by department or status. Salary data is only included for authorized roles.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Name, email or employee number fragment" },
              department: { type: "string" },
              status: { type: "string", description: "ACTIVE, ON_LEAVE or TERMINATED" },
              limit: { type: "integer", description: "Max results, default 10, max 25" },
            },
          },
        },
      },
      execute: async (user, args) => {
        const limit = Math.min(Number(args.limit) || 10, 25);
        const where: Record<string, unknown> = {};
        if (typeof args.query === "string" && args.query.trim()) {
          const q = args.query.trim();
          where.OR = [
            { user: { firstName: { contains: q, mode: "insensitive" } } },
            { user: { lastName: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { employeeId: { contains: q, mode: "insensitive" } },
          ];
        }
        if (typeof args.department === "string" && args.department.trim()) {
          where.department = { name: { contains: args.department.trim(), mode: "insensitive" } };
        }
        if (typeof args.status === "string" && args.status.trim()) {
          where.status = args.status.trim().toUpperCase();
        }
        const rows = (await this.prisma.employee.findMany({
          where,
          select: employeeSelect(SALARY_ROLES.includes(user.role)),
          take: limit,
          orderBy: { employeeId: "asc" },
        })) as EmployeeRow[];
        return {
          count: rows.length,
          employees: rows.map((r) => presentEmployee(r, SALARY_ROLES.includes(user.role))),
        };
      },
    },

    get_employee_detail: {
      schema: {
        type: "function",
        function: {
          name: "get_employee_detail",
          description: "Get detailed information for one employee by their exact employee number.",
          parameters: {
            type: "object",
            properties: { employeeId: { type: "string" } },
            required: ["employeeId"],
          },
        },
      },
      execute: async (user, args) => {
        const employeeId = String(args.employeeId ?? "").trim();
        const row = (await this.prisma.employee.findUnique({
          where: { employeeId },
          select: {
            ...employeeSelect(SALARY_ROLES.includes(user.role)),
            birthDate: true,
            address: true,
            nationalId: true,
            leaves: { where: { status: "PENDING" }, select: { id: true } },
          },
        })) as EmployeeRow | null;
        if (!row) return { found: false, employeeId };
        return {
          found: true,
          employee: {
            ...presentEmployee(row, SALARY_ROLES.includes(user.role)),
            pendingLeaveRequests: row.leaves?.length ?? 0,
          },
        };
      },
    },

    get_my_profile: {
      schema: {
        type: "function",
        function: {
          name: "get_my_profile",
          description: "Get the current user's own employee profile.",
          parameters: { type: "object", properties: {} },
        },
      },
      execute: async (user) => {
        const row = await this.prisma.employee.findFirst({
          where: { userId: user.id },
          select: employeeSelect(true),
        });
        if (!row) return { found: false };
        return { found: true, employee: presentEmployee(row as EmployeeRow, true) };
      },
    },

    get_leave_balances: {
      schema: {
        type: "function",
        function: {
          name: "get_leave_balances",
          description:
            "Get remaining leave balances per leave type for an employee. Omit employeeId to get your own balances.",
          parameters: {
            type: "object",
            properties: { employeeId: { type: "string" } },
          },
        },
      },
      execute: async (user, args) => {
        let employeeId = typeof args.employeeId === "string" ? args.employeeId.trim() : "";
        if (!employeeId || user.role === "EMPLOYEE") {
          const own = await this.prisma.employee.findFirst({
            where: { userId: user.id },
            select: { employeeId: true },
          });
          if (!own) return { found: false };
          employeeId = own.employeeId;
        }
        const employee = await this.prisma.employee.findUnique({
          where: { employeeId },
          select: {
            employeeId: true,
            user: { select: { firstName: true, lastName: true } },
          },
        });
        if (!employee) return { found: false, employeeId };
        const [leaveTypes, approvedLeaves] = await Promise.all([
          this.prisma.leaveType.findMany({ orderBy: { name: "asc" } }),
          this.prisma.leave.findMany({
            where: { employeeId, status: "APPROVED" },
            select: { leaveTypeId: true, days: true },
          }),
        ]);
        return {
          found: true,
          employeeId,
          name: employee.user
            ? `${employee.user.firstName} ${employee.user.lastName}`.trim()
            : employeeId,
          balances: leaveTypes.map((lt) => {
            const taken = approvedLeaves
              .filter((l) => l.leaveTypeId === lt.id)
              .reduce((sum, l) => sum + l.days, 0);
            return { leaveType: lt.name, entitlement: lt.defaultDays, taken, remaining: lt.defaultDays - taken };
          }),
        };
      },
    },

    get_pending_leave_approvals: {
      schema: {
        type: "function",
        function: {
          name: "get_pending_leave_approvals",
          description: "List leave requests awaiting approval.",
          parameters: { type: "object", properties: { limit: { type: "integer" } } },
        },
      },
      execute: async (user, args) => {
        if (!HR_ROLES.includes(user.role)) {
          throw new ForbiddenException("You do not have permission to view leave approvals");
        }
        const rows = await this.prisma.leave.findMany({
          where: { status: "PENDING" },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            days: true,
            reason: true,
            employee: {
              select: { employeeId: true, user: { select: { firstName: true, lastName: true } } },
            },
            leaveType: { select: { name: true } },
          },
          take: Math.min(Number(args.limit) || 15, 50),
          orderBy: { startDate: "asc" },
        });
        return {
          count: rows.length,
          requests: rows.map((r) => ({
            id: r.id,
            employeeId: r.employee.employeeId,
            employee: r.employee.user
              ? `${r.employee.user.firstName} ${r.employee.user.lastName}`.trim()
              : r.employee.employeeId,
            leaveType: r.leaveType.name,
            startDate: r.startDate,
            endDate: r.endDate,
            days: r.days,
            reason: r.reason,
          })),
        };
      },
    },

    get_attendance_exceptions: {
      schema: {
        type: "function",
        function: {
          name: "get_attendance_exceptions",
          description:
            "Find employees with repeated late arrivals in a month. Defaults to the current month, minimum 3 lates.",
          parameters: {
            type: "object",
            properties: {
              year: { type: "integer" },
              month: { type: "integer", description: "1-12" },
              minLate: { type: "integer" },
            },
          },
        },
      },
      execute: async (user, args) => {
        if (!HR_ROLES.includes(user.role)) {
          throw new ForbiddenException("You do not have permission to view attendance analytics");
        }
        const now = new Date();
        const year = Number(args.year) || now.getFullYear();
        const month = Number(args.month) || now.getMonth() + 1;
        const minLate = Number(args.minLate) || 3;
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        const grouped = await this.prisma.attendance.groupBy({
          by: ["employeeId"],
          where: { date: { gte: start, lt: end }, status: "LATE" },
          _count: { employeeId: true },
          having: { employeeId: { _count: { gte: minLate } } },
        });
        const ids = grouped.map((g) => g.employeeId);
        const employees = await this.prisma.employee.findMany({
          where: { id: { in: ids } },
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        });
        const byId = new Map(employees.map((e) => [e.id, e]));
        return {
          year,
          month,
          minLate,
          employees: grouped
            .map((g) => {
              const e = byId.get(g.employeeId);
              if (!e) return null;
              return {
                employeeId: e.employeeId,
                name: e.user ? `${e.user.firstName} ${e.user.lastName}`.trim() : e.employeeId,
                lateCount: g._count.employeeId,
              };
            })
            .filter(Boolean),
        };
      },
    },

    get_payroll_summary: {
      schema: {
        type: "function",
        function: {
          name: "get_payroll_summary",
          description:
            "Get payroll totals for a period (gross, net, deductions, count by status). Restricted to payroll-authorized roles.",
          parameters: {
            type: "object",
            properties: { year: { type: "integer" }, month: { type: "integer", description: "1-12" } },
            required: ["year"],
          },
        },
      },
      execute: async (user, args) => {
        if (!PAYROLL_ROLES.includes(user.role)) {
          throw new ForbiddenException("You do not have permission to view payroll data");
        }
        const year = Number(args.year);
        const month = typeof args.month === "number" ? Number(args.month) : undefined;
        const where: Record<string, unknown> = { periodYear: year };
        if (month) where.periodMonth = month;
        const rows = await this.prisma.payroll.findMany({
          where,
          select: { grossSalary: true, netPay: true, deductions: true, status: true },
        });
        const sum = (pick: (r: (typeof rows)[number]) => unknown) =>
          rows.reduce((acc, r) => acc + Number(pick(r) ?? 0), 0);
        return {
          year,
          month: month ?? "all",
          records: rows.length,
          grossPay: sum((r) => r.grossSalary),
          netPay: sum((r) => r.netPay),
          deductions: sum((r) => r.deductions),
          byStatus: rows.reduce<Record<string, number>>((acc, r) => {
            acc[r.status] = (acc[r.status] ?? 0) + 1;
            return acc;
          }, {}),
        };
      },
    },
  };

  listSchemas(user: AiUser): ProviderToolSchema[] {
    const schemas = Object.values(this.tools).map((t) => t.schema);
    if (!PAYROLL_ROLES.includes(user.role)) {
      return schemas.filter((s) => s.function.name !== "get_payroll_summary");
    }
    return schemas;
  }

  hasTool(name: string): boolean {
    return name in this.tools;
  }

  async execute(name: string, user: AiUser, rawArgs: string): Promise<unknown> {
    const tool = this.tools[name];
    if (!tool) throw new ForbiddenException(`Unknown tool: ${name}`);
    let args: Record<string, unknown> = {};
    if (rawArgs && rawArgs.trim()) {
      try {
        args = JSON.parse(rawArgs) as Record<string, unknown>;
      } catch {
        return { error: "Invalid tool arguments (not valid JSON)" };
      }
    }
    return tool.execute(user, args);
  }
}
