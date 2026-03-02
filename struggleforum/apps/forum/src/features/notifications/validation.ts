import { z } from "zod";

export const NotificationIdParamSchema = z.object({
  id: z.uuid("Invalid notification id"),
});
