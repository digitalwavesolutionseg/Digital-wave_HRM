const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const envPath = path.join(__dirname, "..", "backend", ".env");
const env = fs.readFileSync(envPath, "utf8");
const line = env.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));
const url = line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
const password = decodeURIComponent(url.match("://[^:]+:([^@]+)@")[1]);
const ref = "rposvfugpfxtiirwihzu";

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2",
  "ap-northeast-1", "ap-northeast-2", "ap-east-1", "sa-east-1", "ca-central-1",
];

(async () => {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const client = new Client({
      host,
      port: 5432,
      user: `postgres.${ref}`,
      password,
      database: "postgres",
      connectionTimeoutMillis: 8000,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      console.log(`MATCH: ${host}`);
      await client.end();
      process.exit(0);
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      console.log(`${host} -> ${msg.split("\n")[0].slice(0, 90)}`);
    } finally {
      try { await client.end(); } catch {}
    }
  }
  console.log("NO MATCH");
})();
