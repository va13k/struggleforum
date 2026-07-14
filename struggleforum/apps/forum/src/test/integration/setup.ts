import "dotenv/config";
import { afterAll, beforeEach } from "vitest";
import { testPrisma } from "./client";
import { resetDatabase } from "./reset-database";

beforeEach(async () => {
  await resetDatabase(testPrisma);
});

afterAll(async () => {
  await testPrisma.$disconnect();
});
