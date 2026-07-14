import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteCategory, updateCategory } from "./service";
import * as categoryRepository from "./repository";
import { ConflictError, NotFoundError } from "@/src/server/http/errors";

vi.mock("./repository", () => ({
  getCategoryById: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getCategoryPostCount: vi.fn(),
}));

describe("categories service", () => {
  const prisma = {} as any;
  const categoryId = "category-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a category that exists", async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValue({
      id: categoryId,
      name: "General",
      description: null,
      createdAt: new Date(),
    } as any);
    vi.mocked(categoryRepository.updateCategory).mockResolvedValue({
      id: categoryId,
      name: "Updated name",
      description: null,
      createdAt: new Date(),
    } as any);

    const result = await updateCategory(prisma, categoryId, {
      name: "Updated name",
    });

    expect(result.name).toBe("Updated name");
    expect(categoryRepository.updateCategory).toHaveBeenCalledWith(
      prisma,
      categoryId,
      {
        name: "Updated name",
        description: undefined,
      },
    );
  });

  it("rejects updating a category that does not exist", async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValue(null);

    await expect(
      updateCategory(prisma, categoryId, { name: "Updated name" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes a category with no posts", async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValue({
      id: categoryId,
      name: "General",
      description: null,
      createdAt: new Date(),
    } as any);
    vi.mocked(categoryRepository.getCategoryPostCount).mockResolvedValue(0);

    await deleteCategory(prisma, categoryId);

    expect(categoryRepository.deleteCategory).toHaveBeenCalledWith(
      prisma,
      categoryId,
    );
  });

  it("rejects deleting a category that does not exist", async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValue(null);

    await expect(deleteCategory(prisma, categoryId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("rejects deleting a category with existing posts", async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValue({
      id: categoryId,
      name: "General",
      description: null,
      createdAt: new Date(),
    } as any);
    vi.mocked(categoryRepository.getCategoryPostCount).mockResolvedValue(3);

    await expect(deleteCategory(prisma, categoryId)).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(categoryRepository.deleteCategory).not.toHaveBeenCalled();
  });
});
