import { z } from "zod";

export const UserIdParamSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const UserRoleSchema = z.enum(["USER", "ADMIN"]).default("USER");

export const CreateUserBodySchema = z.object({
  username: z.string().min(3, "Username is required (min 3)").max(40),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: UserRoleSchema.optional(),
});

export const UpdateUserBodySchema = z
  .object({
    username: z.string().min(3).max(40).optional(),
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    role: UserRoleSchema.optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });
