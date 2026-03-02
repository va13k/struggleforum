import type { PrismaClient, Role } from "@prisma/client";
import { getCommentById } from "@/src/features/comments/repository";
import { createLikeNotification } from "@/src/features/notifications/service";
import { getPostOwnerRecord } from "@/src/features/posts/repository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/src/server/http/errors";
import {
  createLike as createLikeRepo,
  deleteLike as deleteLikeRepo,
  getLikeById,
  getUserCommentLike,
  getUserPostLike,
} from "./repository";
import { CreateLikeBodySchema } from "./validation";

export async function createLike(
  prisma: PrismaClient,
  actor: { id: string; username: string },
  input: unknown,
) {
  const data = CreateLikeBodySchema.parse(input);

  if (data.targetType === "post") {
    const post = await getPostOwnerRecord(prisma, data.targetId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const existingLike = await getUserPostLike(prisma, actor.id, data.targetId);

    if (existingLike) {
      throw new ConflictError("Post already liked");
    }

    const like = await createLikeRepo(prisma, {
      userId: actor.id,
      postId: data.targetId,
    });

    await createLikeNotification(prisma, {
      userId: post.authorId,
      actorId: actor.id,
      actorUsername: actor.username,
      postId: data.targetId,
      targetLabel: "post",
    });

    return {
      id: like.id,
      targetType: "post" as const,
      targetId: data.targetId,
      createdAt: like.createdAt,
    };
  }

  const comment = await getCommentById(prisma, data.targetId);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  const existingLike = await getUserCommentLike(
    prisma,
    actor.id,
    data.targetId,
  );

  if (existingLike) {
    throw new ConflictError("Comment already liked");
  }

  const like = await createLikeRepo(prisma, {
    userId: actor.id,
    commentId: data.targetId,
  });

  await createLikeNotification(prisma, {
    userId: comment.authorId,
    actorId: actor.id,
    actorUsername: actor.username,
    commentId: data.targetId,
    postId: comment.postId,
    targetLabel: "comment",
  });

  return {
    id: like.id,
    targetType: "comment" as const,
    targetId: data.targetId,
    createdAt: like.createdAt,
  };
}

export async function deleteLike(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
) {
  const like = await getLikeById(prisma, id);

  if (!like) {
    throw new NotFoundError("Like not found");
  }

  if (like.userId !== actor.id && actor.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  await deleteLikeRepo(prisma, id);
}
