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

/**
 * Name of the httpOnly cookie that carries the session token. The token is
 * never exposed to client-side JavaScript - it lives only in this cookie and
 * in the `sessions` table.
 */
export const SESSION_COOKIE_NAME = "sf_session";

export type AuthenticatedSession = SessionWithUser;

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

/**
 * Cookie attributes for setting the session cookie. `secure` is only enabled
 * outside local development because local dev runs over plain HTTP - a
 * `secure` cookie would silently never be sent by the browser there.
 */
export function sessionCookieOptions(maxAgeMs: number = SESSION_TTL_MS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

export function extractSessionToken(req: Pick<NextRequest, "cookies">) {
  return req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function requireSession(
  prisma: PrismaClient,
  req: NextRequest,
): Promise<AuthenticatedSession> {
  const token = extractSessionToken(req);

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
