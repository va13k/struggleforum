import type { PrismaClient } from "@prisma/client/extension";
import {
  listPosts as listPostsRepo,
  getPostById as getPostByIdRepo,
  getPostByIdWithRelations as getPostByIdWithRelationsRepo,
  searchPosts as searchPostsRepo,
  createPost as createPostRepo,
  updatePost as updatePostRepo,
  deletePost as deletePostRepo,
  type PostPublic,
  type PostWithRelations,
} from "./repository";
import {
  CreatePostBodySchema,
  UpdatePostBodySchema,
} from "@/src/server/validation/posts";

export async function listPosts(prisma: PrismaClient): Promise<PostPublic[]> {
  return await listPostsRepo(prisma);
}

export async function getPostById(
  prisma: PrismaClient,
  id: string,
): Promise<PostPublic | null> {
  return await getPostByIdRepo(prisma, id);
}

export async function getPostByIdWithRelations(
  prisma: PrismaClient,
  id: string,
): Promise<PostWithRelations | null> {
  return await getPostByIdWithRelationsRepo(prisma, id);
}

type SearchPostsInput = {
  query: string;
  page?: number;
  limit?: number;
};

export async function searchPosts(
  prisma: PrismaClient,
  input: SearchPostsInput,
): Promise<PostPublic[]> {
  if (input.query.length < 3) {
    return [];
  }

  const page = Math.max(1, Math.floor(input.page ?? 1));
  const take = Math.min(Math.max(Math.floor(input.limit ?? 10), 1), 50);
  const skip = (page - 1) * take;

  return await searchPostsRepo(prisma, input.query.trim(), skip, take);
}

export async function createPost(
  prisma: PrismaClient,
  input: unknown,
): Promise<PostPublic> {
  const data = CreatePostBodySchema.parse(input);
  return await createPostRepo(prisma, data);
}

export async function updatePost(
  prisma: PrismaClient,
  id: string,
  input: unknown,
): Promise<PostPublic> {
  const data = UpdatePostBodySchema.parse(input);
  return await updatePostRepo(prisma, id, data);
}

export async function deletePost(
  prisma: PrismaClient,
  id: string,
): Promise<PostPublic> {
  return await deletePostRepo(prisma, id);
}
