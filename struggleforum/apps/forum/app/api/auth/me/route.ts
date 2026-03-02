import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { toErrorResponse } from "@/src/server/http/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(prisma, req);
    return NextResponse.json(session.user);
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch current user.");
  }
}
