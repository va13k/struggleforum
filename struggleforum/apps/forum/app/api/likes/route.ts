import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { createLike } from "@/src/features/likes/service";
import { CreateLikeBodySchema } from "@/src/features/likes/validation";

export async function POST(req: NextRequest) {
  const body = await parseJson(req, CreateLikeBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    const like = await createLike(prisma, session.user, body.data);
    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create like.");
  }
}
