import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

const likeSelect = {
  id: true,
  userId: true,
  postId: true,
  commentId: true,
  createdAt: true,
} satisfies Prisma.LikeSelect;

export type LikeRecord = Prisma.LikeGetPayload<{ select: typeof likeSelect }>;

export async function getLikeById(
  prisma: PrismaClient,
  id: string,
): Promise<LikeRecord | null> {
  return prisma.like.findUnique({
    where: { id },
    select: likeSelect,
  });
}

export async function getUserPostLike(
  prisma: PrismaClient,
  userId: string,
  postId: string,
): Promise<LikeRecord | null> {
  return prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: likeSelect,
  });
}

export async function getUserCommentLike(
  prisma: PrismaClient,
  userId: string,
  commentId: string,
): Promise<LikeRecord | null> {
  return prisma.like.findUnique({
    where: { userId_commentId: { userId, commentId } },
    select: likeSelect,
  });
}

export async function createLike(
  prisma: PrismaClient,
  data: { userId: string; postId?: string; commentId?: string },
): Promise<LikeRecord> {
  return prisma.like.create({
    data,
    select: likeSelect,
  });
}

export async function deleteLike(prisma: PrismaClient, id: string) {
  await prisma.like.delete({ where: { id } });
}
