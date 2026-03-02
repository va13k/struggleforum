import { Role } from "@prisma/client";
import { z } from "zod";

const AvatarUrlSchema = z
  .url("Invalid avatar URL")
  .transform((value) => (value === "" ? null : value));

export const UserIdParamSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const UserIncludeQuerySchema = z.enum(["posts", "comments", "sessions"]);

export const UserRoleSchema = z.enum([Role.USER, Role.ADMIN]);

export const UserProfileUpdateBodySchema = z
  .object({
    username: z.string().trim().min(3).max(40).optional(),
    email: z.email("Invalid email").optional(),
    avatarUrl: AvatarUrlSchema.optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });

export const AdminUpdateUserRoleBodySchema = z.object({
  role: UserRoleSchema,
});
