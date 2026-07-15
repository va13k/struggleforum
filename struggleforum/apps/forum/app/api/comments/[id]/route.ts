import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import {
  CommentIdParamSchema,
  UpdateCommentBodySchema,
} from "@/src/features/comments/validation";
import { deleteComment, updateComment } from "@/src/features/comments/service";

export const PUT = withAuth<{ id: string }>(
  async (req: NextRequest, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, CommentIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const body = await parseJson(req, UpdateCommentBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const comment = await updateComment(
      prisma,
      session.user,
      parsedParams.data.id,
      body.data,
    );
    return NextResponse.json(comment);
  },
  { fallbackMessage: "Failed to update comment." },
);

export const DELETE = withAuth<{ id: string }>(
  async (_req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, CommentIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    await deleteComment(prisma, session.user, parsedParams.data.id);
    return NextResponse.json({ message: "Comment deleted successfully" });
  },
  { fallbackMessage: "Failed to delete comment." },
);
