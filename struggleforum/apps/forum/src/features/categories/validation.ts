import { z } from "zod";

export const CreateCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
});
