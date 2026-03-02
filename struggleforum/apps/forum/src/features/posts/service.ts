import type { PrismaClient, Role } from "@prisma/client";
import { getCategoryById } from "@/src/features/categories/repository";
import { createModerationNotification } from "@/src/features/notifications/service";
import { ForbiddenError, NotFoundError } from "@/src/server/http/errors";
import {
  createPost as createPostRepo,
  deletePost as deletePostRepo,
  getPostById as getPostByIdRepo,
  getPostOwnerRecord,
  listPosts as listPostsRepo,
  setPostLocked as setPostLockedRepo,
  updatePost as updatePostRepo,
} from "./repository";
import {
  CreatePostBodySchema,
  ListPostsQuerySchema,
  UpdatePostBodySchema,
} from "../../server/validation/posts";

export async function listPosts(prisma: PrismaClient, input: unknown) {
  const query = ListPostsQuerySchema.parse(input);
  const { posts, total } = await listPostsRepo(prisma, {
    page: query.page,
    limit: query.limit,
    categoryId: query.category,
  });

  return {
    posts,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
    },
  };
}

export async function getPostById(prisma: PrismaClient, id: string) {
  const post = await getPostByIdRepo(prisma, id);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  return post;
}

export async function createPost(
  prisma: PrismaClient,
  authorId: string,
  input: unknown,
) {
  const data = CreatePostBodySchema.parse(input);
  const category = await getCategoryById(prisma, data.categoryId);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return createPostRepo(prisma, {
    authorId,
    categoryId: data.categoryId,
    title: data.title.trim(),
    content: data.content.trim(),
  });
}

export async function updatePost(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
  input: unknown,
) {
  const data = UpdatePostBodySchema.parse(input);
  const post = await getPostOwnerRecord(prisma, id);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.authorId !== actor.id && actor.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  if (data.categoryId) {
    const category = await getCategoryById(prisma, data.categoryId);

    if (!category) {
      throw new NotFoundError("Category not found");
    }
  }

  return updatePostRepo(prisma, id, {
    categoryId: data.categoryId,
    title: data.title?.trim(),
    content: data.content?.trim(),
  });
}

export async function deletePost(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
) {
  const post = await getPostOwnerRecord(prisma, id);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.authorId !== actor.id) {
    throw new ForbiddenError();
  }

  await deletePostRepo(prisma, id);
}

export async function deletePostAsAdmin(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
  reason: string,
) {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  const post = await getPostOwnerRecord(prisma, id);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  await createModerationNotification(prisma, {
    userId: post.authorId,
    actorId: actor.id,
    targetLabel: "post",
    reason,
  });

  await deletePostRepo(prisma, id);
}

export async function setPostLocked(
  prisma: PrismaClient,
  actor: { id: string; role: Role },
  id: string,
  locked: boolean,
) {
  const post = await getPostOwnerRecord(prisma, id);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.authorId !== actor.id) {
    throw new ForbiddenError();
  }

  return setPostLockedRepo(prisma, id, locked);
}
