import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireAdmin, requireSession } from "@/src/server/auth/session";
import { toErrorResponse } from "@/src/server/http/errors";
import { listAdminUsers } from "@/src/features/admin/service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(prisma, req);
    requireAdmin(session);
    const users = await listAdminUsers(prisma);
    return NextResponse.json(users);
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch admin users.");
  }
}
