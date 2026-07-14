import "dotenv/config";
import { execSync } from "node:child_process";
import { Client } from "pg";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required to run integration tests. See .env.example.",
  );
}

const targetUrl = new URL(testDatabaseUrl);
const dbName = targetUrl.pathname.replace(/^\//, "");

if (!dbName.endsWith("_test")) {
  throw new Error(
    `TEST_DATABASE_URL must point at a database whose name ends in "_test" (got "${dbName}"). Refusing to continue.`,
  );
}

const adminUrl = new URL(testDatabaseUrl);
adminUrl.pathname = "/postgres";

async function ensureDatabaseExists() {
  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();

  try {
    const { rowCount } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );

    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created test database "${dbName}".`);
    }
  } finally {
    await client.end();
  }
}

await ensureDatabaseExists();

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: testDatabaseUrl },
});
