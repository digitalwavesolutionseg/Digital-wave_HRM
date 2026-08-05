import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@digitalwave.solutions" },
    update: {},
    create: {
      email: "admin@digitalwave.solutions",
      password: passwordHash,
      firstName: "Digital",
      lastName: "Wave",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const hr = await prisma.user.upsert({
    where: { email: "hr@digitalwave.solutions" },
    update: {},
    create: {
      email: "hr@digitalwave.solutions",
      password: passwordHash,
      firstName: "HR",
      lastName: "Manager",
      role: "HR",
      isActive: true,
    },
  });

  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {},
    create: { name: "Engineering", description: "Software development and engineering" },
  });

  const hrDept = await prisma.department.upsert({
    where: { name: "Human Resources" },
    update: {},
    create: { name: "Human Resources", description: "People operations and talent" },
  });

  const finance = await prisma.department.upsert({
    where: { name: "Finance" },
    update: {},
    create: { name: "Finance", description: "Accounting and financial planning" },
  });

  const marketing = await prisma.department.upsert({
    where: { name: "Marketing" },
    update: {},
    create: { name: "Marketing", description: "Brand and growth" },
  });

  const positions = [
    { title: "Software Engineer", departmentId: engineering.id, employmentType: "FULL_TIME", minSalary: 15000, maxSalary: 30000 },
    { title: "Senior Software Engineer", departmentId: engineering.id, employmentType: "FULL_TIME", minSalary: 30000, maxSalary: 60000 },
    { title: "Product Designer", departmentId: marketing.id, employmentType: "FULL_TIME", minSalary: 12000, maxSalary: 25000 },
    { title: "HR Specialist", departmentId: hrDept.id, employmentType: "FULL_TIME", minSalary: 12000, maxSalary: 22000 },
    { title: "Financial Analyst", departmentId: finance.id, employmentType: "FULL_TIME", minSalary: 15000, maxSalary: 28000 },
  ];

  const positionIds: Record<string, string> = {};
  for (const p of positions) {
    const existing = await prisma.position.findFirst({
      where: { title: p.title, departmentId: p.departmentId },
    });
    if (existing) {
      positionIds[p.title] = existing.id;
    } else {
      const created = await prisma.position.create({ data: p as any });
      positionIds[p.title] = created.id;
    }
  }

  const employeeCount = await prisma.employee.count();
  if (employeeCount === 0) {
    await prisma.employee.createMany({
      data: [
        {
          employeeId: "DW-0001",
          userId: admin.id,
          gender: "OTHER",
          departmentId: engineering.id,
          positionId: positionIds["Senior Software Engineer"],
          joiningDate: new Date("2023-01-15"),
          status: "ACTIVE",
          salary: 30000,
        },
        {
          employeeId: "DW-0002",
          userId: hr.id,
          gender: "FEMALE",
          departmentId: hrDept.id,
          positionId: positionIds["HR Specialist"],
          joiningDate: new Date("2023-03-01"),
          status: "ACTIVE",
          salary: 20000,
        },
      ],
    });
  }

  const vacation = await prisma.leaveType.upsert({
    where: { name: "Annual Leave" },
    update: {},
    create: { name: "Annual Leave", defaultDays: 21, color: "#0B5FFF" },
  });
  await prisma.leaveType.upsert({
    where: { name: "Sick Leave" },
    update: {},
    create: { name: "Sick Leave", defaultDays: 14, color: "#F59E0B" },
  });
  await prisma.leaveType.upsert({
    where: { name: "Unpaid Leave" },
    update: {},
    create: { name: "Unpaid Leave", defaultDays: 0, color: "#64748B" },
  });

  await prisma.companySetting.upsert({
    where: { key: "companyName" },
    update: {},
    create: { key: "companyName", value: "Digital Wave Solutions" },
  });
  await prisma.companySetting.upsert({
    where: { key: "currency" },
    update: {},
    create: { key: "currency", value: "EGP" },
  });

  console.log("Seed complete.");
  console.log(`  Admin: admin@digitalwave.solutions / Admin@123`);
  console.log(`  HR:    hr@digitalwave.solutions / Admin@123`);
  void vacation;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
