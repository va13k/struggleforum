import type { PrismaClient } from "@prisma/client/extension";

export async function resetDatabase(prisma: PrismaClient) {
  const [{ current_database: currentDatabase }] = await prisma.$queryRaw<
    { current_database: string }[]
  >`SELECT current_database()`;

  if (!currentDatabase.endsWith("_test")) {
    throw new Error(
      `Refusing to truncate database "${currentDatabase}" - resetDatabase() only runs against databases whose name ends in "_test".`,
    );
  }

  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;

  if (tables.length === 0) {
    return;
  }

  const tableNames = tables
    .map((table: { tablename: string }) => `"public"."${table.tablename}"`)
    .join(", ");

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`,
  );
}
