import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const count = await prisma.$executeRawUnsafe(
    `UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "emailVerifiedAt" IS NULL`
  );
  console.log("backfilled:", count);
  const users = await prisma.user.findMany({ select: { email: true, emailVerifiedAt: true } });
  console.log(users.map((u) => `${u.email}:${u.emailVerifiedAt ? "verified" : "NULL"}`).join(" | "));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
