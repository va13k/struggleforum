import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { logout } from "@/src/features/auth/service";

export const POST = withAuth(
  async (_req, session) => {
    await logout(prisma, session.token);
    return NextResponse.json({ message: "Logged out successfully" });
  },
  { fallbackMessage: "Failed to logout." },
);
