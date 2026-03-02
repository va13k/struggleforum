import { z } from "zod";

export const CommentIdParamSchema = z.object({
  id: z.uuid("Invalid comment id"),
});

export const CreateCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(5000),
  parentId: z.uuid("Invalid parent comment id").optional(),
});

export const UpdateCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(5000),
});
