import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { listNotifications } from "@/src/features/notifications/service";

export const GET = withAuth(
  async (_req, session) => {
    const notifications = await listNotifications(prisma, session.user.id);
    return NextResponse.json({ notifications });
  },
  { fallbackMessage: "Failed to fetch notifications." },
);
