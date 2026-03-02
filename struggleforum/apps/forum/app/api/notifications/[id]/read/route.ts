import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { markNotificationRead } from "@/src/features/notifications/service";
import { NotificationIdParamSchema } from "@/src/features/notifications/validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, NotificationIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  try {
    const session = await requireSession(prisma, req);
    const notification = await markNotificationRead(
      prisma,
      session.user.id,
      parsedParams.data.id,
    );
    return NextResponse.json(notification);
  } catch (error) {
    return toErrorResponse(error, "Failed to update notification.");
  }
}
