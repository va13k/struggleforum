import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withPublicRoute } from "@/src/server/auth/route-handlers";

export const GET = withPublicRoute(
  "Health check must be reachable without auth for uptime monitoring.",
  async () => {
    const result = await prisma.user.count();
    return NextResponse.json({ status: "ok", userCount: result });
  },
);
