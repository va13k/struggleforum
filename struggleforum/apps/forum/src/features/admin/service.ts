import type { PrismaClient } from "@prisma/client/extension";
import {
  listAdminUsers as listAdminUsersRepo,
  updateUser as updateUserRepo,
} from "@/src/features/users/repository";
import { deleteCommentAsAdmin } from "@/src/features/comments/service";
import { deletePostAsAdmin } from "@/src/features/posts/service";
import { AdminUpdateUserRoleBodySchema } from "@/src/server/validation/users";

export async function listAdminUsers(prisma: PrismaClient) {
  return listAdminUsersRepo(prisma);
}

export async function updateUserRole(
  prisma: PrismaClient,
  id: string,
  input: unknown,
) {
  const data = AdminUpdateUserRoleBodySchema.parse(input);
  return updateUserRepo(prisma, id, { role: data.role });
}

export async function deletePost(
  prisma: PrismaClient,
  actor: { id: string; role: "ADMIN" },
  id: string,
  reason: string,
) {
  await deletePostAsAdmin(prisma, actor, id, reason);
}

export async function deleteComment(
  prisma: PrismaClient,
  actor: { id: string; role: "ADMIN" },
  id: string,
  reason: string,
) {
  await deleteCommentAsAdmin(prisma, actor, id, reason);
}
