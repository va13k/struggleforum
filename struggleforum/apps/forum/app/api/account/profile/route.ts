import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { parseJson } from "@/src/server/http/validation";
import { updateOwnProfile } from "@/src/features/users/service";
import { UserProfileUpdateBodySchema } from "@/src/server/validation/users";

export const GET = withAuth(
  async (_req: NextRequest, session) => {
    return NextResponse.json(session.user);
  },
  { fallbackMessage: "Failed to fetch account profile." },
);

export const PATCH = withAuth(
  async (req: NextRequest, session) => {
    const body = await parseJson(req, UserProfileUpdateBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const user = await updateOwnProfile(prisma, session.user.id, body.data);
    return NextResponse.json(user);
  },
  { fallbackMessage: "Failed to update account profile." },
);
