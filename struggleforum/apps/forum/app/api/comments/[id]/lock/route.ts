import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { setCommentLocked } from "@/src/features/comments/service";
import { CommentIdParamSchema } from "@/src/features/comments/validation";

export const POST = withAuth<{ id: string }>(
  async (_req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, CommentIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const comment = await setCommentLocked(
      prisma,
      session.user,
      parsedParams.data.id,
      true,
    );
    return NextResponse.json(comment);
  },
  { fallbackMessage: "Failed to lock comment." },
);
