import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { markNotificationRead } from "@/src/features/notifications/service";
import { NotificationIdParamSchema } from "@/src/features/notifications/validation";

export const PUT = withAuth<{ id: string }>(
  async (_req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, NotificationIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const notification = await markNotificationRead(
      prisma,
      session.user.id,
      parsedParams.data.id,
    );
    return NextResponse.json(notification);
  },
  { fallbackMessage: "Failed to update notification." },
);
