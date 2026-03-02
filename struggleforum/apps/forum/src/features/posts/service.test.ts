import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deletePost,
  deletePostAsAdmin,
  setPostLocked,
  updatePost,
} from "./service";
import * as postRepository from "./repository";
import * as categoryRepository from "@/src/features/categories/repository";
import * as notificationService from "@/src/features/notifications/service";
import { ForbiddenError } from "@/src/server/http/errors";

vi.mock("./repository", () => ({
  createPost: vi.fn(),
  deletePost: vi.fn(),
  getPostById: vi.fn(),
  getPostOwnerRecord: vi.fn(),
  listPosts: vi.fn(),
  setPostLocked: vi.fn(),
  updatePost: vi.fn(),
}));

vi.mock("@/src/features/categories/repository", () => ({
  getCategoryById: vi.fn(),
}));

vi.mock("@/src/features/notifications/service", () => ({
  createModerationNotification: vi.fn(),
}));

describe("posts service", () => {
  const prisma = {} as any;
  const owner = { id: "user-1", role: "USER" as const };
  const admin = { id: "admin-1", role: "ADMIN" as const };
  const postId = "post-1";
  const originalCategoryId = "11111111-1111-4111-8111-111111111111";
  const nextCategoryId = "22222222-2222-4222-8222-222222222222";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows an owner to lock a post", async () => {
    vi.mocked(postRepository.getPostOwnerRecord).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: originalCategoryId,
      locked: false,
    } as any);
    vi.mocked(postRepository.setPostLocked).mockResolvedValue({
      id: postId,
      locked: true,
    } as any);

    const result = await setPostLocked(prisma, owner, postId, true);

    expect(result).toEqual({ id: postId, locked: true });
  });

  it("allows an admin to lock another user's post", async () => {
    vi.mocked(postRepository.getPostOwnerRecord).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: originalCategoryId,
      locked: false,
    } as any);
    vi.mocked(postRepository.setPostLocked).mockResolvedValue({
      id: postId,
      locked: true,
    } as any);

    const result = await setPostLocked(prisma, admin, postId, true);

    expect(result).toEqual({ id: postId, locked: true });
  });

  it("rejects locking by a non-owner non-admin", async () => {
    vi.mocked(postRepository.getPostOwnerRecord).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: originalCategoryId,
      locked: false,
    } as any);

    await expect(
      setPostLocked(prisma, { id: "user-2", role: "USER" }, postId, true),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("allows updating a locked post for the owner", async () => {
    vi.mocked(postRepository.getPostOwnerRecord).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: originalCategoryId,
      locked: true,
    } as any);
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValue({
      id: nextCategoryId,
    } as any);
    vi.mocked(postRepository.updatePost).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: nextCategoryId,
      title: "Updated title",
      content: "Updated content body",
      locked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: owner.id, username: "alice", avatarUrl: null, role: "USER" },
      category: { id: nextCategoryId, name: "General", description: null, createdAt: new Date() },
      _count: { likes: 0, comments: 0 },
    } as any);

    const result = await updatePost(prisma, owner, postId, {
      title: "Updated title",
      content: "Updated content body",
      categoryId: nextCategoryId,
    });

    expect(result.title).toBe("Updated title");
  });

  it("allows deleting a locked post for the owner", async () => {
    vi.mocked(postRepository.getPostOwnerRecord).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: originalCategoryId,
      locked: true,
    } as any);

    await deletePost(prisma, owner, postId);

    expect(postRepository.deletePost).toHaveBeenCalledWith(prisma, postId);
  });

  it("rejects normal post deletion by admins when they are not the owner", async () => {
    vi.mocked(postRepository.getPostOwnerRecord).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: originalCategoryId,
      locked: false,
    } as any);

    await expect(deletePost(prisma, admin, postId)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("allows admin moderation delete with a notification reason", async () => {
    vi.mocked(postRepository.getPostOwnerRecord).mockResolvedValue({
      id: postId,
      authorId: owner.id,
      categoryId: originalCategoryId,
      locked: false,
    } as any);

    await deletePostAsAdmin(prisma, admin, postId, "Advertising prohibited services");

    expect(notificationService.createModerationNotification).toHaveBeenCalledWith(
      prisma,
      {
        userId: owner.id,
        actorId: admin.id,
        targetLabel: "post",
        reason: "Advertising prohibited services",
      },
    );
    expect(postRepository.deletePost).toHaveBeenCalledWith(prisma, postId);
  });
});
