import type { Prisma, Role } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

const sessionPublicSelect = {
  id: true,
  createdAt: true,
  lastActivity: true,
  expiresAt: true,
} satisfies Prisma.SessionSelect;

const postSummarySelect = {
  id: true,
  authorId: true,
  categoryId: true,
  title: true,
  content: true,
  locked: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PostSelect;

const commentSummarySelect = {
  id: true,
  postId: true,
  authorId: true,
  parentId: true,
  content: true,
  depth: true,
  locked: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CommentSelect;

export const publicUserSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const privateUserSelect = {
  ...publicUserSelect,
  email: true,
} satisfies Prisma.UserSelect;

export const adminUserSelect = {
  ...privateUserSelect,
} satisfies Prisma.UserSelect;

const userWithPasswordSelect = {
  ...privateUserSelect,
  passwordHash: true,
} satisfies Prisma.UserSelect;

const publicUserSelectWithPosts = {
  ...publicUserSelect,
  posts: { select: postSummarySelect },
} satisfies Prisma.UserSelect;

const publicUserSelectWithComments = {
  ...publicUserSelect,
  comments: { select: commentSummarySelect },
} satisfies Prisma.UserSelect;

const privateUserSelectWithSessions = {
  ...privateUserSelect,
  sessions: { select: sessionPublicSelect },
} satisfies Prisma.UserSelect;

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;
export type UserPrivate = Prisma.UserGetPayload<{
  select: typeof privateUserSelect;
}>;
export type UserAdmin = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;
export type UserAuth = Prisma.UserGetPayload<{
  select: typeof userWithPasswordSelect;
}>;
export type UserWithPosts = Prisma.UserGetPayload<{
  select: typeof publicUserSelectWithPosts;
}>;
export type UserWithComments = Prisma.UserGetPayload<{
  select: typeof publicUserSelectWithComments;
}>;
export type UserWithSessions = Prisma.UserGetPayload<{
  select: typeof privateUserSelectWithSessions;
}>;

export async function listAdminUsers(
  prisma: PrismaClient,
): Promise<UserAdmin[]> {
  return prisma.user.findMany({
    select: adminUserSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(
  prisma: PrismaClient,
  id: string,
): Promise<UserPublic | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}

export async function getUserByUsername(
  prisma: PrismaClient,
  username: string,
): Promise<UserPublic | null> {
  return prisma.user.findUnique({
    where: { username },
    select: publicUserSelect,
  });
}

export async function getUserAuthByEmail(
  prisma: PrismaClient,
  email: string,
): Promise<UserAuth | null> {
  return prisma.user.findUnique({
    where: { email },
    select: userWithPasswordSelect,
  });
}

export async function getUserAuthById(
  prisma: PrismaClient,
  id: string,
): Promise<UserAuth | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userWithPasswordSelect,
  });
}

export async function findUsersByUsernames(
  prisma: PrismaClient,
  usernames: string[],
): Promise<UserPublic[]> {
  return prisma.user.findMany({
    where: { username: { in: usernames } },
    select: publicUserSelect,
  });
}

export async function getUserWithPosts(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithPosts | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelectWithPosts,
  });
}

export async function getUserWithComments(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithComments | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelectWithComments,
  });
}

export async function getUserSessions(
  prisma: PrismaClient,
  id: string,
): Promise<UserWithSessions | null> {
  return prisma.user.findUnique({
    where: { id },
    select: privateUserSelectWithSessions,
  });
}

export async function createUser(
  prisma: PrismaClient,
  data: {
    username: string;
    email: string;
    avatarUrl?: string | null;
    passwordHash: string;
    role: Role;
  },
): Promise<UserPrivate> {
  return prisma.user.create({
    data,
    select: privateUserSelect,
  });
}

export async function updateUser(
  prisma: PrismaClient,
  id: string,
  data: Partial<{
    username: string;
    email: string;
    avatarUrl: string | null;
    passwordHash: string;
    role: Role;
  }>,
): Promise<UserPrivate> {
  return prisma.user.update({
    where: { id },
    data,
    select: privateUserSelect,
  });
}
