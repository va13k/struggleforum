import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "General",
    description: "General discussion and open conversation.",
  },
  {
    name: "Struggle Philosophy",
    description: "Discussion about the ideas and practice of Struggle.",
  },
  {
    name: "Support",
    description: "Questions, help, and community support.",
  },
  {
    name: "Announcements",
    description: "Project news and official updates.",
  },
];

const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.SEED_ADMIN_PASSWORD ?? "change-this-local-password";

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: category,
    });
  }
}

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      username: adminUsername,
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      username: adminUsername,
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: Role.ADMIN,
    },
  });
}

async function main() {
  await seedCategories();
  await seedAdminUser();

  console.log("Seeded default categories and local admin user.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
