import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { publicUserSelect } from "@/src/features/users/repository";

const commentPublicSelect = {
  id: true,
  postId: true,
  authorId: true,
  parentId: true,
  content: true,
  depth: true,
  locked: true,
  createdAt: true,
  updatedAt: true,
  author: { select: publicUserSelect },
  _count: { select: { likes: true } },
} satisfies Prisma.CommentSelect;

const commentOwnerSelect = {
  id: true,
  postId: true,
  authorId: true,
  parentId: true,
  depth: true,
  locked: true,
} satisfies Prisma.CommentSelect;

const commentLockSelect = {
  id: true,
  locked: true,
} satisfies Prisma.CommentSelect;

export type CommentPublic = Prisma.CommentGetPayload<{
  select: typeof commentPublicSelect;
}>;
export type CommentOwnerRecord = Prisma.CommentGetPayload<{
  select: typeof commentOwnerSelect;
}>;
export type CommentLockRecord = Prisma.CommentGetPayload<{
  select: typeof commentLockSelect;
}>;
export type CommentTree = CommentPublic & { replies: CommentTree[] };

export async function listCommentsByPost(
  prisma: PrismaClient,
  postId: string,
): Promise<CommentPublic[]> {
  return prisma.comment.findMany({
    where: { postId },
    select: commentPublicSelect,
    orderBy: [{ depth: "asc" }, { createdAt: "asc" }],
  });
}

export async function getCommentById(
  prisma: PrismaClient,
  id: string,
): Promise<CommentOwnerRecord | null> {
  return prisma.comment.findUnique({
    where: { id },
    select: commentOwnerSelect,
  });
}

export async function createComment(
  prisma: PrismaClient,
  data: {
    postId: string;
    authorId: string;
    parentId?: string;
    content: string;
    depth: number;
  },
): Promise<CommentPublic> {
  return prisma.comment.create({
    data,
    select: commentPublicSelect,
  });
}

export async function updateComment(
  prisma: PrismaClient,
  id: string,
  data: { content: string },
): Promise<CommentPublic> {
  return prisma.comment.update({
    where: { id },
    data,
    select: commentPublicSelect,
  });
}

export async function deleteComment(prisma: PrismaClient, id: string) {
  await prisma.comment.delete({ where: { id } });
}

export async function setCommentLocked(
  prisma: PrismaClient,
  id: string,
  locked: boolean,
): Promise<CommentLockRecord> {
  return prisma.comment.update({
    where: { id },
    data: { locked },
    select: commentLockSelect,
  });
}
