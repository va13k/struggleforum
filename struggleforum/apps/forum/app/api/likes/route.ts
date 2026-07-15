import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { parseJson } from "@/src/server/http/validation";
import { createLike } from "@/src/features/likes/service";
import { CreateLikeBodySchema } from "@/src/features/likes/validation";

export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await parseJson(req, CreateLikeBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const like = await createLike(prisma, session.user, body.data);
    return NextResponse.json(like, { status: 201 });
  },
  { fallbackMessage: "Failed to create like." },
);
