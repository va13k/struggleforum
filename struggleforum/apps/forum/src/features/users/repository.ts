import type { PrismaClient } from "@prisma/client/extension";

/** Base selection for user public fields */
export type UserSelect = {
  id: true;
  username: true;
  email: true;
  role: true;
  createdAt: true;
  updatedAt: true;
};

/** User with posts field */
export type UserWithPosts = UserSelect & {
  posts: true;
};

/** User with comments field */
export type UserWithComments = UserSelect & {
  comments: true;
};

/** User with sessions field */
export type UserWithSessions = UserSelect & {
  sessions: true;
};

/** Shared Prisma select for user queries */
const userSelect: UserSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

/** Lists all users with public fields only. */
export async function listUsers(prisma: PrismaClient): Promise<UserSelect[]> {
  return prisma.user.findMany({ select: userSelect });
}

/** Get a user by id with public fields only; returns null if missing. */
export async function getUserById(
  prisma: PrismaClient,
  id: string,
): Promise<UserSelect | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

/** Get a user by username with public fields only; returns null if missing. */
export async function getUserByUsername(
  prisma: PrismaClient,
  username: string,
): Promise<UserSelect | null> {
  return prisma.user.findUnique({
    where: { username },
    select: userSelect,
  });
}

/** Get a user by id + posts; returns null if missing. */
export async function getUserWithPosts(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithPosts | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { ...userSelect, posts: true },
  });
}

/** Get a user by id + comments; returns null if missing. */
export async function getUserWithComments(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithComments | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { ...userSelect, comments: true },
  });
}

/** Get a user by id + sessions; returns null if missing. */
export async function getUserSessions(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithSessions | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { ...userSelect, sessions: true },
  });
}

/** Create a user and return public fields only. */
export async function createUser(
  prisma: PrismaClient,
  data: {
    username: string;
    email: string;
    passwordHash: string;
    role: "USER" | "ADMIN";
  },
): Promise<UserSelect> {
  return prisma.user.create({
    data,
    select: userSelect,
  });
}

/** Update a user and return public fields only. */
export async function updateUser(
  prisma: PrismaClient,
  id: string,
  data: Partial<{
    username: string;
    email: string;
    passwordHash: string;
    role: "USER" | "ADMIN";
  }>,
): Promise<UserSelect> {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

/** Delete a user by id and return public fields only. */
export async function deleteUser(
  prisma: PrismaClient,
  id: string,
): Promise<UserSelect> {
  return prisma.user.delete({ where: { id }, select: userSelect });
}
