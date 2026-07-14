import type { PrismaClient } from "@prisma/client/extension";
import { normalizeOptionalText } from "@/src/lib/utils";
import {
  createCategory as createCategoryRepo,
  deleteCategory as deleteCategoryRepo,
  getCategoryById as getCategoryByIdRepo,
  getCategoryPostCount,
  listCategories as listCategoriesRepo,
  updateCategory as updateCategoryRepo,
} from "./repository";
import {
  CreateCategoryBodySchema,
  UpdateCategoryBodySchema,
} from "./validation";
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

export async function updateCategory(
  prisma: PrismaClient,
  id: string,
  input: unknown,
) {
  const data = UpdateCategoryBodySchema.parse(input);
  const category = await getCategoryByIdRepo(prisma, id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return updateCategoryRepo(prisma, id, {
    name: data.name?.trim(),
    description:
      data.description === undefined
        ? undefined
        : normalizeOptionalText(data.description),
  });
}

export async function deleteCategory(prisma: PrismaClient, id: string) {
  const category = await getCategoryByIdRepo(prisma, id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const deletedPostCount = (await getCategoryPostCount(prisma, id)) ?? 0;

  await deleteCategoryRepo(prisma, id);

  return { deletedPostCount };
}
