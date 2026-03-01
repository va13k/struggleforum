import type { PrismaClient } from "@prisma/client/extension";
import { NotFoundError } from "@/src/server/http/errors";
import { normalizeAvatarUrl, normalizeEmail } from "@/src/lib/utils";
import {
  getUserById as getUserByIdRepo,
  getUserByUsername as getUserByUsernameRepo,
  getUserSessions as getUserSessionsRepo,
  getUserWithComments as getUserWithCommentsRepo,
  getUserWithPosts as getUserWithPostsRepo,
  updateUser as updateUserRepo,
  type UserPrivate,
  type UserPublic,
  type UserWithComments,
  type UserWithPosts,
  type UserWithSessions,
} from "./repository";
import {
  AdminUpdateUserRoleBodySchema,
  UserProfileUpdateBodySchema,
} from "../../server/validation/users";

export async function getUserById(
  prisma: PrismaClient,
  id: string,
): Promise<UserPublic> {
  const user = await getUserByIdRepo(prisma, id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function getUserByUsername(
  prisma: PrismaClient,
  username: string,
): Promise<UserPublic> {
  const user = await getUserByUsernameRepo(prisma, username);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function getUserWithPosts(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithPosts> {
  const user = await getUserWithPostsRepo(prisma, id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function getUserWithComments(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithComments> {
  const user = await getUserWithCommentsRepo(prisma, id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function getUserSessions(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithSessions> {
  const user = await getUserSessionsRepo(prisma, id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function updateOwnProfile(
  prisma: PrismaClient,
  id: string,
  input: unknown,
): Promise<UserPrivate> {
  const data = UserProfileUpdateBodySchema.parse(input);

  return updateUserRepo(prisma, id, {
    username: data.username?.trim(),
    email: data.email ? normalizeEmail(data.email) : undefined,
    avatarUrl: normalizeAvatarUrl(data.avatarUrl),
  });
}

export async function updateUserRole(
  prisma: PrismaClient,
  id: string,
  input: unknown,
): Promise<UserPrivate> {
  const data = AdminUpdateUserRoleBodySchema.parse(input);
  return updateUserRepo(prisma, id, { role: data.role });
}
