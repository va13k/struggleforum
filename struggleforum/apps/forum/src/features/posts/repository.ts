import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { userSelect } from "@/src/features/users/repository";

const postSelect = {
  id: true,
  authorId: true,
  categoryId: true,
  title: true,
  content: true,
  locked: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PostSelect;

const postWithRelationsSelect = {
  ...postSelect,
  author: { select: userSelect },
  category: true,
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostSelect;

export type PostSelect = Prisma.PostSelect;
export type PostPublic = Prisma.PostGetPayload<{ select: typeof postSelect }>;

export type PostWithRelations = Prisma.PostGetPayload<{
  select: typeof postWithRelationsSelect;
}>;

/** Lists all posts */
export async function listPosts(prisma: PrismaClient): Promise<PostPublic[]> {
  return prisma.post.findMany({ select: postSelect });
}

/** Get post by id; returns null otherwise */
export async function getPostById(
  prisma: PrismaClient,
  id: string,
): Promise<PostPublic | null> {
  return prisma.post.findUnique({
    where: { id },
    select: postSelect,
  });
}

/** Get post by id with relations and counts; returns null if missing. */
export async function getPostByIdWithRelations(
  prisma: PrismaClient,
  id: string,
): Promise<PostWithRelations | null> {
  return prisma.post.findUnique({
    where: { id },
    select: postWithRelationsSelect,
  });
}

/** Get posts with substring that appears in post title or content; returns empty array if missing. */
export async function searchPosts(
  prisma: PrismaClient,
  query: string,
  skip = 0,
  take = 20,
): Promise<PostPublic[]> {
  return prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

/** Create a post and return its fields only. */
export async function createPost(
  prisma: PrismaClient,
  data: {
    authorId: string;
    categoryId: string;
    title: string;
    content: string;
    locked?: boolean;
  },
): Promise<PostPublic> {
  return prisma.post.create({
    data,
    select: postSelect,
  });
}

/** Update a post and return its fields only. */
export async function updatePost(
  prisma: PrismaClient,
  id: string,
  data: Partial<{
    title: string;
    content: string;
    locked: boolean;
  }>,
): Promise<PostPublic> {
  return prisma.post.update({
    where: { id },
    data,
    select: postSelect,
  });
}

/** Delete a post by id and return its fields only. */
export async function deletePost(
  prisma: PrismaClient,
  id: string,
): Promise<PostPublic> {
  return prisma.post.delete({
    where: { id },
    select: postSelect,
  });
}
