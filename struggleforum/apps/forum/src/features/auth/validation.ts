import { z } from "zod";

const AvatarUrlSchema = z
  .union([z.string().trim().url("Invalid avatar URL"), z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

export const RegisterBodySchema = z.object({
  username: z.string().trim().min(3).max(40),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  avatarUrl: AvatarUrlSchema.optional(),
});

export const LoginBodySchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const ChangePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
