import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAdmin } from "@/src/server/auth/route-handlers";
import { listAdminUsers } from "@/src/features/admin/service";

export const GET = withAdmin(
  async () => {
    const users = await listAdminUsers(prisma);
    return NextResponse.json(users);
  },
  { fallbackMessage: "Failed to fetch admin users." },
);
