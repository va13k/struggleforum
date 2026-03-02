import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteComment,
  deleteCommentAsAdmin,
  setCommentLocked,
  updateComment,
} from "./service";
import * as commentRepository from "./repository";
import * as notificationService from "@/src/features/notifications/service";
import { ForbiddenError } from "@/src/server/http/errors";

vi.mock("./repository", () => ({
  createComment: vi.fn(),
  deleteComment: vi.fn(),
  getCommentById: vi.fn(),
  listCommentsByPost: vi.fn(),
  setCommentLocked: vi.fn(),
  updateComment: vi.fn(),
}));

vi.mock("@/src/features/posts/repository", () => ({
  getPostOwnerRecord: vi.fn(),
}));

vi.mock("@/src/features/notifications/service", () => ({
  createCommentNotifications: vi.fn(),
  createModerationNotification: vi.fn(),
}));

describe("comments service", () => {
  const prisma = {} as any;
  const owner = { id: "user-1", role: "USER" as const };
  const admin = { id: "admin-1", role: "ADMIN" as const };
  const commentId = "comment-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows an owner to lock a comment", async () => {
    vi.mocked(commentRepository.getCommentById).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      depth: 0,
      locked: false,
    } as any);
    vi.mocked(commentRepository.setCommentLocked).mockResolvedValue({
      id: commentId,
      locked: true,
    } as any);

    const result = await setCommentLocked(prisma, owner, commentId, true);

    expect(result).toEqual({ id: commentId, locked: true });
  });

  it("rejects locking by an admin who is not the owner", async () => {
    vi.mocked(commentRepository.getCommentById).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      depth: 0,
      locked: false,
    } as any);

    await expect(setCommentLocked(prisma, admin, commentId, true)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("rejects locking by a non-owner", async () => {
    vi.mocked(commentRepository.getCommentById).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      depth: 0,
      locked: false,
    } as any);

    await expect(
      setCommentLocked(prisma, { id: "user-2", role: "USER" }, commentId, true),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("allows updating a locked comment for the owner", async () => {
    vi.mocked(commentRepository.getCommentById).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      depth: 0,
      locked: true,
    } as any);
    vi.mocked(commentRepository.updateComment).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      content: "Updated comment",
      depth: 0,
      locked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: owner.id, username: "alice", avatarUrl: null, role: "USER" },
      _count: { likes: 0 },
    } as any);

    const result = await updateComment(prisma, owner, commentId, {
      content: "Updated comment",
    });

    expect(result.content).toBe("Updated comment");
  });

  it("allows deleting a locked comment for the owner", async () => {
    vi.mocked(commentRepository.getCommentById).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      depth: 0,
      locked: true,
    } as any);

    await deleteComment(prisma, owner, commentId);

    expect(commentRepository.deleteComment).toHaveBeenCalledWith(prisma, commentId);
  });

  it("rejects normal comment deletion by admins when they are not the owner", async () => {
    vi.mocked(commentRepository.getCommentById).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      depth: 0,
      locked: false,
    } as any);

    await expect(deleteComment(prisma, admin, commentId)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("allows admin moderation delete with a notification reason", async () => {
    vi.mocked(commentRepository.getCommentById).mockResolvedValue({
      id: commentId,
      postId: "post-1",
      authorId: owner.id,
      parentId: null,
      depth: 0,
      locked: false,
    } as any);

    await deleteCommentAsAdmin(prisma, admin, commentId, "Contains prohibited promotion");

    expect(notificationService.createModerationNotification).toHaveBeenCalledWith(
      prisma,
      {
        userId: owner.id,
        actorId: admin.id,
        targetLabel: "comment",
        reason: "Contains prohibited promotion",
      },
    );
    expect(commentRepository.deleteComment).toHaveBeenCalledWith(prisma, commentId);
  });
});
