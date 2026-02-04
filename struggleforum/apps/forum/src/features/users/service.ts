import type { PrismaClient } from "@prisma/client/extension";
import bcrypt from "bcryptjs";
import {
  CreateUserBodySchema,
  UpdateUserBodySchema,
} from "@/src/server/validation/users";
import {
  createUser as createUserRepo,
  deleteUser as deleteUserRepo,
  listUsers as listUsersRepo,
  updateUser as updateUserRepo,
  getUserById,
  getUserByUsername,
  getUserWithPosts,
  getUserWithComments,
  getUserSessions,
  type UserSelect,
  type UserWithPosts,
  type UserWithComments,
  type UserWithSessions,
} from "./repository";

/** Get users with public fields */
export async function listUsers(prisma: PrismaClient): Promise<UserSelect[]> {
  return await listUsersRepo(prisma);
}

/** Get user declaration */
/** ID */
export function getUser(
  prisma: PrismaClient,
  opts: { id: string },
): Promise<UserSelect>;

/** Username */
export function getUser(
  prisma: PrismaClient,
  opts: { username: string },
): Promise<UserSelect>;

/** User with Posts */
export function getUser(
  prisma: PrismaClient,
  opts: { id: string },
  relation: "posts",
): Promise<UserWithPosts>;

/** User with Comments */
export function getUser(
  prisma: PrismaClient,
  opts: { id: string },
  relation: "comments",
): Promise<UserWithComments>;

/** User with Sessions */
export function getUser(
  prisma: PrismaClient,
  opts: { id: string },
  relation: "sessions",
): Promise<UserWithSessions>;

/** Get user using Username */
export function getUser(
  prisma: PrismaClient,
  opts: { username: string },
): Promise<UserSelect>;

/** Get user Implementation */
export async function getUser(
  prisma: PrismaClient,
  opts: { id: string } | { username: string },
  relation?: "posts" | "comments" | "sessions",
) {
  let user;

  if ("username" in opts) {
    user = await getUserByUsername(prisma, opts.username);
  } else {
    if (relation === "posts") {
      user = await getUserWithPosts(prisma, opts.id);
    } else if (relation === "comments") {
      user = await getUserWithComments(prisma, opts.id);
    } else if (relation === "sessions") {
      user = await getUserSessions(prisma, opts.id);
    } else {
      user = await getUserById(prisma, opts.id);
    }
  }

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/** Create user with public fields only. */
export async function createUser(prisma: PrismaClient, input: unknown) {
  const data = CreateUserBodySchema.parse(input);
  const passwordHash = await bcrypt.hash(data.password, 10);

  return createUserRepo(prisma, {
    username: data.username,
    email: data.email,
    passwordHash,
    role: data.role ?? "USER",
  });
}

/** Update user's public fields. */
export async function updateUser(
  prisma: PrismaClient,
  id: string,
  input: unknown,
) {
  const data = UpdateUserBodySchema.parse(input);
  const updateData: {
    username?: string;
    email?: string;
    passwordHash?: string;
    role?: "USER" | "ADMIN";
  } = {
    username: data.username,
    email: data.email,
    role: data.role,
  };

  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  return updateUserRepo(prisma, id, updateData);
}

/** Delete user */
export async function deleteUser(prisma: PrismaClient, id: string) {
  return deleteUserRepo(prisma, id);
}
