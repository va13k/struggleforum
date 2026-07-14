import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.TEST_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "TEST_DATABASE_URL is required to run integration tests. See .env.example.",
  );
}

const dbName = new URL(connectionString).pathname.replace(/^\//, "");

if (!dbName.endsWith("_test")) {
  throw new Error(
    `TEST_DATABASE_URL must point at a database whose name ends in "_test" (got "${dbName}"). Refusing to run integration tests against it.`,
  );
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const testPrisma = new PrismaClient({ adapter });
