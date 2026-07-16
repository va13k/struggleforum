export type UserPublic = {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export type UserPrivate = UserPublic & {
  email: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
};

export type NotificationType =
  | "COMMENT"
  | "LIKE"
  | "REPLY"
  | "MENTION"
  | "MODERATION";

export type Notification = {
  id: string;
  userId: string;
  actorId: string | null;
  type: NotificationType;
  content: string;
  postId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
};
