import type { Prisma, NotificationType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { publicUserSelect } from "@/src/features/users/repository";

const notificationSelect = {
  id: true,
  userId: true,
  actorId: true,
  type: true,
  content: true,
  postId: true,
  commentId: true,
  isRead: true,
  createdAt: true,
  actor: { select: publicUserSelect },
} satisfies Prisma.NotificationSelect;

export type NotificationPublic = Prisma.NotificationGetPayload<{
  select: typeof notificationSelect;
}>;

export async function listNotifications(
  prisma: PrismaClient,
  userId: string,
): Promise<NotificationPublic[]> {
  return prisma.notification.findMany({
    where: { userId },
    select: notificationSelect,
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });
}

export async function getNotificationById(
  prisma: PrismaClient,
  id: string,
): Promise<NotificationPublic | null> {
  return prisma.notification.findUnique({
    where: { id },
    select: notificationSelect,
  });
}

export async function createNotification(
  prisma: PrismaClient,
  data: {
    userId: string;
    actorId?: string;
    type: NotificationType;
    content: string;
    postId?: string;
    commentId?: string;
  },
): Promise<NotificationPublic> {
  return prisma.notification.create({
    data,
    select: notificationSelect,
  });
}

export async function markNotificationRead(
  prisma: PrismaClient,
  id: string,
): Promise<NotificationPublic> {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: notificationSelect,
  });
}
