import { z } from "zod";

export const LikeIdParamSchema = z.object({
  id: z.uuid("Invalid like id"),
});

export const CreateLikeBodySchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.uuid("Invalid target id"),
});
