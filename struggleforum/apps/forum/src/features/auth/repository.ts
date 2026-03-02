import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { privateUserSelect } from "@/src/features/users/repository";

const sessionSelect = {
  id: true,
  userId: true,
  token: true,
  createdAt: true,
  lastActivity: true,
  expiresAt: true,
  user: { select: privateUserSelect },
} satisfies Prisma.SessionSelect;

export type SessionWithUser = Prisma.SessionGetPayload<{
  select: typeof sessionSelect;
}>;

export async function createSession(
  prisma: PrismaClient,
  data: {
    userId: string;
    token: string;
    lastActivity: Date;
    expiresAt: Date;
  },
): Promise<SessionWithUser> {
  return prisma.session.create({
    data,
    select: sessionSelect,
  });
}

export async function getSessionByToken(
  prisma: PrismaClient,
  token: string,
): Promise<SessionWithUser | null> {
  return prisma.session.findUnique({
    where: { token },
    select: sessionSelect,
  });
}

export async function updateSessionActivity(
  prisma: PrismaClient,
  id: string,
  lastActivity: Date,
  expiresAt: Date,
): Promise<SessionWithUser> {
  return prisma.session.update({
    where: { id },
    data: { lastActivity, expiresAt },
    select: sessionSelect,
  });
}

export async function deleteSessionById(prisma: PrismaClient, id: string) {
  await prisma.session.delete({ where: { id } });
}

export async function deleteSessionByToken(
  prisma: PrismaClient,
  token: string,
) {
  await prisma.session.deleteMany({ where: { token } });
}
