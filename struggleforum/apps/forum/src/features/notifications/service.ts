import type { PrismaClient } from "@prisma/client/extension";
import { NotificationType } from "@prisma/client";
import { findUsersByUsernames } from "@/src/features/users/repository";
import { extractMentions } from "@/src/lib/utils";
import { ForbiddenError, NotFoundError } from "@/src/server/http/errors";
import {
  createNotification as createNotificationRepo,
  getNotificationById,
  listNotifications as listNotificationsRepo,
  markNotificationRead as markNotificationReadRepo,
} from "./repository";

export async function listNotifications(prisma: PrismaClient, userId: string) {
  return listNotificationsRepo(prisma, userId);
}

export async function markNotificationRead(
  prisma: PrismaClient,
  userId: string,
  id: string,
) {
  const notification = await getNotificationById(prisma, id);

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError();
  }

  return markNotificationReadRepo(prisma, id);
}

export async function createNotification(
  prisma: PrismaClient,
  input: {
    userId: string;
    actorId?: string;
    type: NotificationType;
    content: string;
    postId?: string;
    commentId?: string;
  },
) {
  if (input.actorId && input.userId === input.actorId) {
    return null;
  }

  return createNotificationRepo(prisma, input);
}

export async function createCommentNotifications(
  prisma: PrismaClient,
  input: {
    actorId: string;
    actorUsername: string;
    postAuthorId: string;
    commentAuthorId?: string | null;
    postId: string;
    commentId: string;
    content: string;
  },
) {
  await createNotification(prisma, {
    userId: input.postAuthorId,
    actorId: input.actorId,
    type: NotificationType.COMMENT,
    content: `${input.actorUsername} commented on your post`,
    postId: input.postId,
    commentId: input.commentId,
  });

  if (input.commentAuthorId && input.commentAuthorId !== input.postAuthorId) {
    await createNotification(prisma, {
      userId: input.commentAuthorId,
      actorId: input.actorId,
      type: NotificationType.REPLY,
      content: `${input.actorUsername} replied to your comment`,
      postId: input.postId,
      commentId: input.commentId,
    });
  }

  await createMentionNotifications(prisma, {
    actorId: input.actorId,
    actorUsername: input.actorUsername,
    content: input.content,
    postId: input.postId,
    commentId: input.commentId,
  });
}

export async function createLikeNotification(
  prisma: PrismaClient,
  input: {
    userId: string;
    actorId: string;
    actorUsername: string;
    postId?: string;
    commentId?: string;
    targetLabel: "post" | "comment";
  },
) {
  await createNotification(prisma, {
    userId: input.userId,
    actorId: input.actorId,
    type: NotificationType.LIKE,
    content: `${input.actorUsername} liked your ${input.targetLabel}`,
    postId: input.postId,
    commentId: input.commentId,
  });
}

export async function createMentionNotifications(
  prisma: PrismaClient,
  input: {
    actorId: string;
    actorUsername: string;
    content: string;
    postId?: string;
    commentId?: string;
  },
) {
  const mentionedUsernames = extractMentions(input.content);

  if (mentionedUsernames.length === 0) {
    return;
  }

  const users = await findUsersByUsernames(prisma, mentionedUsernames);

  await Promise.all(
    users.map((user) =>
      createNotification(prisma, {
        userId: user.id,
        actorId: input.actorId,
        type: NotificationType.MENTION,
        content: `${input.actorUsername} mentioned you`,
        postId: input.postId,
        commentId: input.commentId,
      }),
    ),
  );
}

export async function createModerationNotification(
  prisma: PrismaClient,
  input: {
    userId: string;
    actorId?: string;
    targetLabel: "post" | "comment";
    reason: string;
  },
) {
  return createNotification(prisma, {
    userId: input.userId,
    actorId: input.actorId,
    type: NotificationType.MODERATION,
    content: `Your ${input.targetLabel} was removed by moderation. Reason: ${input.reason.trim()}`,
  });
}
