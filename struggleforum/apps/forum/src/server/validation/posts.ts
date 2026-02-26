import { z } from "zod";

export const PostIdParamSchema = z.object({
  id: z.uuid("Invalid post id"),
});

export const CreatePostBodySchema = z.object({
  authorId: z.uuid("Invalid author id"),
  categoryId: z.uuid("Invalid category id"),
  title: z
    .string()
    .trim()
    .min(3, "The post title is required (min 3 symbols)")
    .max(120, "Title is too long (max 120 symbols)"),
  content: z
    .string()
    .min(10)
    .refine((v) => v.trim().length >= 10, {
      message: "The post content is required (min 10 symbols)",
    }),
  locked: z.boolean().optional().default(false),
});

export const UpdatePostBodySchema = z
  .object({
    categoryId: z.uuid("Invalid category id"),
    title: z
      .string()
      .trim()
      .min(3, "The post title is required (min 3 symbols)")
      .max(120, "Title is too long (max 120 symbols)")
      .optional(),
    content: z
      .string()
      .optional()
      .refine((v) => v === undefined || v.trim().length >= 10, {
        message: "The post content is required (min 10 symbols)",
      }),
    locked: z.boolean().optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });
