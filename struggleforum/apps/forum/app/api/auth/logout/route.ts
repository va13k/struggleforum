import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { SESSION_COOKIE_NAME } from "@/src/server/auth/session";
import { logout } from "@/src/features/auth/service";

export const POST = withAuth(
  async (_req, session) => {
    await logout(prisma, session.token);
    const res = NextResponse.json({ message: "Logged out successfully" });
    res.cookies.delete({ name: SESSION_COOKIE_NAME, path: "/" });
    return res;
  },
  { fallbackMessage: "Failed to logout." },
);
