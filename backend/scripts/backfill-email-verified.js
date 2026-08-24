"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../src/generated/prisma/client");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
    const count = await prisma.$executeRawUnsafe(`UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "emailVerifiedAt" IS NULL`);
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
//# sourceMappingURL=backfill-email-verified.js.map