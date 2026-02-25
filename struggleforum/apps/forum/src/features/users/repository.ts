import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

/** Shared Prisma select for user queries */
const userSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

/** Base selection for user public fields */
export type UserSelect = Prisma.UserSelect;

/** User public fields result shape */
export type UserPublic = Prisma.UserGetPayload<{ select: typeof userSelect }>;

/** User with posts field */
const userSelectWithPosts = {
  ...userSelect,
  posts: true,
} satisfies Prisma.UserSelect;

export type UserWithPosts = Prisma.UserGetPayload<{
  select: typeof userSelectWithPosts;
}>;

/** User with comments field */
const userSelectWithComments = {
  ...userSelect,
  comments: true,
} satisfies Prisma.UserSelect;

export type UserWithComments = Prisma.UserGetPayload<{
  select: typeof userSelectWithComments;
}>;

/** User with sessions field */
const userSelectWithSessions = {
  ...userSelect,
  sessions: true,
} satisfies Prisma.UserSelect;

export type UserWithSessions = Prisma.UserGetPayload<{
  select: typeof userSelectWithSessions;
}>;

/** Lists all users with public fields only. */
export async function listUsers(prisma: PrismaClient): Promise<UserPublic[]> {
  return prisma.user.findMany({ select: userSelect });
}

/** Get a user by id with public fields only; returns null if missing. */
export async function getUserById(
  prisma: PrismaClient,
  id: string,
): Promise<UserPublic | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

/** Get a user by username with public fields only; returns null if missing. */
export async function getUserByUsername(
  prisma: PrismaClient,
  username: string,
): Promise<UserPublic | null> {
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
    select: userSelectWithPosts,
  });
}

/** Get a user by id + comments; returns null if missing. */
export async function getUserWithComments(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithComments | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userSelectWithComments,
  });
}

/** Get a user by id + sessions; returns null if missing. */
export async function getUserSessions(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithSessions | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userSelectWithSessions,
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
): Promise<UserPublic> {
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
): Promise<UserPublic> {
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
): Promise<UserPublic> {
  return prisma.user.delete({ where: { id }, select: userSelect });
}
