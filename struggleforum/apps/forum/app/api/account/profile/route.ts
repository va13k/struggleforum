import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { updateOwnProfile } from "@/src/features/users/service";
import { UserProfileUpdateBodySchema } from "@/src/server/validation/users";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(prisma, req);
    return NextResponse.json(session.user);
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch account profile.");
  }
}

export async function PATCH(req: NextRequest) {
  const body = await parseJson(req, UserProfileUpdateBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    const user = await updateOwnProfile(prisma, session.user.id, body.data);
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error, "Failed to update account profile.");
  }
}
