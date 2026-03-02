import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { logout } from "@/src/features/auth/service";
import { requireSession } from "@/src/server/auth/session";
import { toErrorResponse } from "@/src/server/http/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(prisma, req);
    await logout(prisma, session.token);
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to logout.");
  }
}
