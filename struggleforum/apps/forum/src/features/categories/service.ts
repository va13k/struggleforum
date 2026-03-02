import type { PrismaClient } from "@prisma/client/extension";
import { normalizeOptionalText } from "@/src/lib/utils";
import {
  createCategory as createCategoryRepo,
  getCategoryById as getCategoryByIdRepo,
  listCategories as listCategoriesRepo,
} from "./repository";
import { CreateCategoryBodySchema } from "./validation";
import { NotFoundError } from "@/src/server/http/errors";

export async function listCategories(prisma: PrismaClient) {
  return listCategoriesRepo(prisma);
}

export async function getCategoryById(prisma: PrismaClient, id: string) {
  const category = await getCategoryByIdRepo(prisma, id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
}

export async function createCategory(prisma: PrismaClient, input: unknown) {
  const data = CreateCategoryBodySchema.parse(input);

  return createCategoryRepo(prisma, {
    name: data.name.trim(),
    description: normalizeOptionalText(data.description),
  });
}
