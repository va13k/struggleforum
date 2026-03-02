import { randomBytes } from "node:crypto";
import type { PrismaClient, Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import {
  deleteSessionById,
  getSessionByToken,
  updateSessionActivity,
  type SessionWithUser,
} from "@/src/features/auth/repository";
import { ForbiddenError, UnauthorizedError } from "@/src/server/http/errors";

export const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export type AuthenticatedSession = SessionWithUser;

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function extractBearerToken(req: Pick<NextRequest, "headers">) {
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireSession(
  prisma: PrismaClient,
  req: NextRequest,
): Promise<AuthenticatedSession> {
  const token = extractBearerToken(req);

  if (!token) {
    throw new UnauthorizedError();
  }

  const session = await getSessionByToken(prisma, token);

  if (!session) {
    throw new UnauthorizedError("Invalid session");
  }

  const now = new Date();

  if (session.expiresAt <= now) {
    await deleteSessionById(prisma, session.id);
    throw new UnauthorizedError("Session expired");
  }

  return updateSessionActivity(
    prisma,
    session.id,
    now,
    new Date(now.getTime() + SESSION_TTL_MS),
  );
}

export function requireRole(session: AuthenticatedSession, role: Role) {
  if (session.user.role !== role) {
    throw new ForbiddenError();
  }
}

export function requireAdmin(session: AuthenticatedSession) {
  requireRole(session, "ADMIN");
}

export function requireSelfOrAdmin(
  session: AuthenticatedSession,
  userId: string,
) {
  if (session.user.id !== userId && session.user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
}

export function requireOwnerOrAdmin(
  session: AuthenticatedSession,
  ownerId: string,
) {
  requireSelfOrAdmin(session, ownerId);
}
