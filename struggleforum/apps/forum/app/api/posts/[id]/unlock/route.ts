import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { setPostLocked } from "@/src/features/posts/service";
import { PostIdParamSchema } from "@/src/server/validation/posts";

export const POST = withAuth<{ id: string }>(
  async (_req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, PostIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const post = await setPostLocked(
      prisma,
      session.user,
      parsedParams.data.id,
      false,
    );
    return NextResponse.json(post);
  },
  { fallbackMessage: "Failed to unlock post." },
);
