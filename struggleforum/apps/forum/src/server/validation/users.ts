import { z } from "zod";

export const UserIdParamSchema = z.object({
  id: z.cuid("Invalid user id"),
});

export const UserRoleSchema = z.enum(["USER", "ADMIN"]).default("USER");

export const CreateUserBodySchema = z.object({
  name: z.string().min(5, "Name is required (at least 5 symbols)").max(80),
  email: z.email("Invalid email"),
  role: UserRoleSchema.optional(),
  country: z.string().min(2).max(60).optional(),
});

export const UpdateUserBodySchema = z
  .object({
    name: z.string().min(5).max(80).optional(),
    email: z.email().optional(),
    role: UserRoleSchema.optional(),
    country: z.string().min(2).max(60).optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });
