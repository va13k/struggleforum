import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireAdmin, requireSession } from "@/src/server/auth/session";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { CommentIdParamSchema } from "@/src/features/comments/validation";
import { ModerationDeleteBodySchema } from "@/src/features/admin/validation";
import { deleteComment } from "@/src/features/admin/service";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, CommentIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  const body = await parseJson(req, ModerationDeleteBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    requireAdmin(session);
    await deleteComment(
      prisma,
      session.user as { id: string; role: "ADMIN" },
      parsedParams.data.id,
      body.data.reason,
    );
    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete comment.");
  }
}
