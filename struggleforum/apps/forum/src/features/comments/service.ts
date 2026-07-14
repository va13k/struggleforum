import type { PrismaClient, Role } from "@prisma/client";
import { getPostOwnerRecord } from "@/src/features/posts/repository";
import {
  createCommentNotifications,
  createModerationNotification,
} from "@/src/features/notifications/service";
import { ForbiddenError, NotFoundError } from "@/src/server/http/errors";
import {
  createComment as createCommentRepo,
  deleteComment as deleteCommentRepo,
  getCommentById,
  listCommentsByPost as listCommentsByPostRepo,
  setCommentLocked as setCommentLockedRepo,
  type CommentPublic,
  type CommentTree,
  updateComment as updateCommentRepo,
} from "./repository";
import { CreateCommentBodySchema, UpdateCommentBodySchema } from "./validation";

function buildCommentTree(comments: CommentPublic[]): CommentTree[] {
  const byId = new Map<string, CommentTree>();
  const roots: CommentTree[] = [];

  for (const comment of comments) {
    byId.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = byId.get(comment.id)!;

    if (comment.parentId) {
      byId.get(comment.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function listCommentsByPost(prisma: PrismaClient, postId: string) {
  const post = await getPostOwnerRecord(prisma, postId);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const comments = await listCommentsByPostRepo(prisma, postId);
  return { comments: buildCommentTree(comments) };
}

export async function createComment(
  prisma: PrismaClient,
  actor: { id: string; role: Role; username: string },
  postId: string,
  input: unknown,
) {
  const data = CreateCommentBodySchema.parse(input);
  const post = await getPostOwnerRecord(prisma, postId);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.locked && actor.role !== "ADMIN") {
    throw new ForbiddenError("Post is locked");
  }

  let parentCommentAuthorId: string | null = null;
  let depth = 0;

  if (data.parentId) {
    const parentComment = await getCommentById(prisma, data.parentId);

    if (!parentComment || parentComment.postId !== postId) {
      throw new NotFoundError("Parent comment not found");
    }

    if (parentComment.locked && actor.role !== "ADMIN") {
      throw new ForbiddenError("Parent comment is locked");
    }

    parentCommentAuthorId = parentComment.authorId;
    depth = parentComment.depth + 1;
  }

  const comment = await createCommentRepo(prisma, {
    postId,
    authorId: actor.id,
    parentId: data.parentId,
    content: data.content.trim(),
    depth,
  });

  await createCommentNotifications(prisma, {
    actorId: actor.id,
    actorUsername: actor.username,
    postAuthorId: post.authorId,
    commentAuthorId: parentCommentAuthorId,
    postId,
    commentId: comment.id,
    content: comment.content,
  });

  return comment;
}

export async function updateComment(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
  input: unknown,
) {
  const data = UpdateCommentBodySchema.parse(input);
  const comment = await getCommentById(prisma, id);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  if (comment.authorId !== actor.id && actor.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  return updateCommentRepo(prisma, id, { content: data.content.trim() });
}

export async function deleteComment(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
) {
  const comment = await getCommentById(prisma, id);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  if (comment.authorId !== actor.id) {
    throw new ForbiddenError();
  }

  await deleteCommentRepo(prisma, id);
}

export async function deleteCommentAsAdmin(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
  reason: string,
) {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  const comment = await getCommentById(prisma, id);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  await createModerationNotification(prisma, {
    userId: comment.authorId,
    actorId: actor.id,
    targetLabel: "comment",
    reason,
  });

  await deleteCommentRepo(prisma, id);
}

export async function setCommentLocked(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
  locked: boolean,
) {
  const comment = await getCommentById(prisma, id);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  if (comment.authorId !== actor.id && actor.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  return setCommentLockedRepo(prisma, id, locked);
}
