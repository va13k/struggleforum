import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { publicUserSelect } from "@/src/features/users/repository";

const postOwnerSelect = {
  id: true,
  authorId: true,
  categoryId: true,
  locked: true,
} satisfies Prisma.PostSelect;

const postPublicSelect = {
  id: true,
  authorId: true,
  categoryId: true,
  title: true,
  content: true,
  locked: true,
  createdAt: true,
  updatedAt: true,
  author: { select: publicUserSelect },
  category: true,
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostSelect;

const postLockSelect = {
  id: true,
  locked: true,
} satisfies Prisma.PostSelect;

export type PostOwnerRecord = Prisma.PostGetPayload<{
  select: typeof postOwnerSelect;
}>;
export type PostPublic = Prisma.PostGetPayload<{
  select: typeof postPublicSelect;
}>;
export type PostLockRecord = Prisma.PostGetPayload<{
  select: typeof postLockSelect;
}>;

export async function listPosts(
  prisma: PrismaClient,
  input: { page: number; limit: number; categoryId?: string },
): Promise<{ posts: PostPublic[]; total: number }> {
  const where: Prisma.PostWhereInput = input.categoryId
    ? { categoryId: input.categoryId }
    : {};
  const skip = (input.page - 1) * input.limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      select: postPublicSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
}

export async function getPostById(
  prisma: PrismaClient,
  id: string,
): Promise<PostPublic | null> {
  return prisma.post.findUnique({
    where: { id },
    select: postPublicSelect,
  });
}

export async function getPostOwnerRecord(
  prisma: PrismaClient,
  id: string,
): Promise<PostOwnerRecord | null> {
  return prisma.post.findUnique({
    where: { id },
    select: postOwnerSelect,
  });
}

export async function createPost(
  prisma: PrismaClient,
  data: {
    authorId: string;
    categoryId: string;
    title: string;
    content: string;
  },
): Promise<PostPublic> {
  const post = await prisma.post.create({
    data,
    select: { id: true },
  });

  return prisma.post.findUniqueOrThrow({
    where: { id: post.id },
    select: postPublicSelect,
  });
}

export async function updatePost(
  prisma: PrismaClient,
  id: string,
  data: Partial<{
    categoryId: string;
    title: string;
    content: string;
  }>,
): Promise<PostPublic> {
  await prisma.post.update({ where: { id }, data, select: { id: true } });

  return prisma.post.findUniqueOrThrow({
    where: { id },
    select: postPublicSelect,
  });
}

export async function deletePost(prisma: PrismaClient, id: string) {
  await prisma.post.delete({ where: { id } });
}

export async function setPostLocked(
  prisma: PrismaClient,
  id: string,
  locked: boolean,
): Promise<PostLockRecord> {
  return prisma.post.update({
    where: { id },
    data: { locked },
    select: postLockSelect,
  });
}
