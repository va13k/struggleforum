import { z } from "zod";

export const ModerationDeleteBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Reason must be at least 5 characters")
    .max(500, "Reason is too long"),
});
