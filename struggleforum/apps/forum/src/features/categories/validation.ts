import { z } from "zod";

export const CreateCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
});

export const CategoryIdParamSchema = z.object({
  id: z.uuid("Invalid category id"),
});

export const UpdateCategoryBodySchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(500).nullable().optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });
