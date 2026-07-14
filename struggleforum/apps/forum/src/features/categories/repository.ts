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

export async function updateCategory(
  prisma: PrismaClient,
  id: string,
  data: Partial<{ name: string; description: string | null }>,
): Promise<CategoryPublic> {
  await prisma.category.update({ where: { id }, data, select: { id: true } });

  return prisma.category.findUniqueOrThrow({
    where: { id },
    select: categorySelect,
  });
}

export async function deleteCategory(
  prisma: PrismaClient,
  id: string,
): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

export async function getCategoryPostCount(
  prisma: PrismaClient,
  id: string,
): Promise<number | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { posts: true } } },
  });

  return category ? category._count.posts : null;
}
