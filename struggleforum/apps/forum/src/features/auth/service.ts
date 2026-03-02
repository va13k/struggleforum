import bcrypt from "bcryptjs";
import { Role, type PrismaClient } from "@prisma/client";
import {
  createUser,
  getUserAuthByEmail,
  getUserAuthById,
  getUserByUsername,
  updateUser,
} from "@/src/features/users/repository";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/src/server/http/errors";
import { createSession, deleteSessionByToken } from "./repository";
import {
  ChangePasswordBodySchema,
  LoginBodySchema,
  RegisterBodySchema,
} from "./validation";
import {
  generateSessionToken,
  SESSION_TTL_MS,
} from "@/src/server/auth/session";
import { normalizeAvatarUrl, normalizeEmail } from "@/src/lib/utils";

export async function register(prisma: PrismaClient, input: unknown) {
  const data = RegisterBodySchema.parse(input);
  const email = normalizeEmail(data.email);
  const existingEmail = await getUserAuthByEmail(prisma, email);
  const existingUser = await getUserByUsername(prisma, data.username);

  if (existingEmail) {
    throw new ConflictError("Email is already in use");
  }

  if (existingUser) {
    throw new ConflictError("Username is already in use");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await createUser(prisma, {
    username: data.username.trim(),
    email,
    avatarUrl: normalizeAvatarUrl(data.avatarUrl),
    passwordHash,
    role: Role.USER,
  });

  const token = generateSessionToken();
  const now = new Date();

  await createSession(prisma, {
    userId: user.id,
    token,
    lastActivity: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  return { user, token };
}

export async function login(prisma: PrismaClient, input: unknown) {
  const data = LoginBodySchema.parse(input);
  const email = normalizeEmail(data.email);
  const user = await getUserAuthByEmail(prisma, email);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateSessionToken();
  const now = new Date();

  await createSession(prisma, {
    userId: user.id,
    token,
    lastActivity: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  const { passwordHash: _passwordHash, ...userPublic } = user;
  return { user: userPublic, token };
}

export async function logout(prisma: PrismaClient, token: string) {
  await deleteSessionByToken(prisma, token);
}

export async function updatePassword(
  prisma: PrismaClient,
  userId: string,
  input: unknown,
) {
  const data = ChangePasswordBodySchema.parse(input);
  const user = await getUserAuthById(prisma, userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const passwordMatches = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  return updateUser(prisma, userId, { passwordHash });
}
