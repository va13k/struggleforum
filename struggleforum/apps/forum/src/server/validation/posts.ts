import { z } from "zod";

export const PostIdParamSchema = z.object({
  id: z.uuid("Invalid post id"),
});

export const ListPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.uuid("Invalid category id").optional(),
});

export const CreatePostBodySchema = z.object({
  categoryId: z.uuid("Invalid category id"),
  title: z
    .string()
    .trim()
    .min(3, "The post title is required (min 3 symbols)")
    .max(120, "Title is too long (max 120 symbols)"),
  content: z
    .string()
    .min(10)
    .refine((value) => value.trim().length >= 10, {
      message: "The post content is required (min 10 symbols)",
    }),
});

export const UpdatePostBodySchema = z
  .object({
    categoryId: z.uuid("Invalid category id").optional(),
    title: z
      .string()
      .trim()
      .min(3, "The post title is required (min 3 symbols)")
      .max(120, "Title is too long (max 120 symbols)")
      .optional(),
    content: z
      .string()
      .optional()
      .refine((value) => value === undefined || value.trim().length >= 10, {
        message: "The post content is required (min 10 symbols)",
      }),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });
