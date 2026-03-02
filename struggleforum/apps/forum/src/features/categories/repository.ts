import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

const categorySelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
} satisfies Prisma.CategorySelect;

const categoryWithCountSelect = {
  ...categorySelect,
  _count: { select: { posts: true } },
} satisfies Prisma.CategorySelect;

export type CategoryPublic = Prisma.CategoryGetPayload<{
  select: typeof categorySelect;
}>;
export type CategoryWithCount = Prisma.CategoryGetPayload<{
  select: typeof categoryWithCountSelect;
}>;

export async function listCategories(
  prisma: PrismaClient,
): Promise<CategoryWithCount[]> {
  return prisma.category.findMany({
    select: categoryWithCountSelect,
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(
  prisma: PrismaClient,
  id: string,
): Promise<CategoryPublic | null> {
  return prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });
}

export async function createCategory(
  prisma: PrismaClient,
  data: { name: string; description?: string | null },
): Promise<CategoryPublic> {
  return prisma.category.create({
    data,
    select: categorySelect,
  });
}
