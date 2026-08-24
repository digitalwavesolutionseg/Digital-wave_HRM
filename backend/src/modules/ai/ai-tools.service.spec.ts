import { ForbiddenException } from "@nestjs/common";
import { AiToolsService } from "./ai-tools.service";

function makeService() {
  const prisma = {
    employee: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    leaveType: { findMany: jest.fn().mockResolvedValue([]) },
    leave: { findMany: jest.fn().mockResolvedValue([]) },
    attendance: { groupBy: jest.fn().mockResolvedValue([]) },
    payroll: { findMany: jest.fn().mockResolvedValue([]) },
  };
  return { service: new AiToolsService(prisma as never), prisma };
}

const hrUser = { id: "u1", role: "HR" };
const employeeUser = { id: "u2", role: "EMPLOYEE" };
const managerUser = { id: "u3", role: "MANAGER" };

describe("AI tools permission enforcement", () => {
  it("denies payroll summary to non-payroll roles", async () => {
    const { service } = makeService();
    await expect(
      service.execute("get_payroll_summary", employeeUser, JSON.stringify({ year: 2026 }))
    ).rejects.toThrow(ForbiddenException);
    await expect(
      service.execute("get_payroll_summary", managerUser, JSON.stringify({ year: 2026 }))
    ).rejects.toThrow(ForbiddenException);
  });

  it("hides the payroll tool schema from non-payroll roles", () => {
    const { service } = makeService();
    const employeeTools = service.listSchemas(employeeUser).map((t) => t.function.name);
    const hrTools = service.listSchemas(hrUser).map((t) => t.function.name);
    expect(employeeTools).not.toContain("get_payroll_summary");
    expect(hrTools).toContain("get_payroll_summary");
  });

  it("denies leave approvals to employees", async () => {
    const { service } = makeService();
    await expect(service.execute("get_pending_leave_approvals", employeeUser, "{}")).rejects.toThrow(
      ForbiddenException
    );
  });

  it("denies attendance analytics to employees", async () => {
    const { service } = makeService();
    await expect(
      service.execute("get_attendance_exceptions", employeeUser, "{}")
    ).rejects.toThrow(ForbiddenException);
  });

  it("rejects unknown tools", async () => {
    const { service } = makeService();
    await expect(service.execute("run_raw_sql", hrUser, "{}")).rejects.toThrow(ForbiddenException);
  });
});

describe("AI tools data masking", () => {
  it("masks salary fields for non-payroll roles in search results", async () => {
    const { service, prisma } = makeService();
    prisma.employee.findMany.mockResolvedValue([
      {
        id: "e1",
        employeeId: "DW-0001",
        status: "ACTIVE",
        employmentType: "FULL_TIME",
        joiningDate: new Date("2025-01-01"),
        salary: "15000",
        bankName: "CIB",
        bankAccount: "1234567890",
        department: { name: "Engineering" },
        position: { title: "Developer" },
        manager: null,
        user: { firstName: "Ahmed", lastName: "Hassan", email: "ahmed@x.com" },
      },
    ]);
    const result = (await service.execute("search_employees", managerUser, "{}")) as {
      employees: Record<string, unknown>[];
    };
    expect(result.employees[0].salary).toBeUndefined();
    expect(result.employees[0].bankName).toBeUndefined();
    expect(result.employees[0].bankAccount).toBeUndefined();
    expect(result.employees[0].name).toBe("Ahmed Hassan");
  });

  it("includes salary only for authorized roles", async () => {
    const { service, prisma } = makeService();
    prisma.employee.findMany.mockResolvedValue([
      {
        id: "e1",
        employeeId: "DW-0001",
        status: "ACTIVE",
        employmentType: "FULL_TIME",
        joiningDate: new Date("2025-01-01"),
        salary: "15000",
        bankName: "CIB",
        bankAccount: "1234567890",
        department: { name: "Engineering" },
        position: { title: "Developer" },
        manager: null,
        user: { firstName: "Ahmed", lastName: "Hassan", email: "ahmed@x.com" },
      },
    ]);
    const result = (await service.execute("search_employees", hrUser, "{}")) as {
      employees: Record<string, unknown>[];
    };
    expect(result.employees[0].salary).toBe(15000);
    expect(result.employees[0].bankAccount).toBe("****7890");
  });
});
