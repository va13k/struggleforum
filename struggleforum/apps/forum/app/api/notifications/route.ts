import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { toErrorResponse } from "@/src/server/http/errors";
import { listNotifications } from "@/src/features/notifications/service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(prisma, req);
    const notifications = await listNotifications(prisma, session.user.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch notifications.");
  }
}
