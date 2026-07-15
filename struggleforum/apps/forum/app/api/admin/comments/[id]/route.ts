import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAdmin } from "@/src/server/auth/route-handlers";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { CommentIdParamSchema } from "@/src/features/comments/validation";
import { ModerationDeleteBodySchema } from "@/src/features/admin/validation";
import { deleteComment } from "@/src/features/admin/service";

export const DELETE = withAdmin<{ id: string }>(
  async (req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, CommentIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const body = await parseJson(req, ModerationDeleteBodySchema);

    if (!body.ok) {
      return body.res;
    }

    await deleteComment(
      prisma,
      session.user as { id: string; role: "ADMIN" },
      parsedParams.data.id,
      body.data.reason,
    );
    return NextResponse.json({ message: "Comment deleted successfully" });
  },
  { fallbackMessage: "Failed to delete comment." },
);
