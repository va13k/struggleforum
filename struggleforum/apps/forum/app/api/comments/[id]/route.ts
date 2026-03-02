import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import {
  CommentIdParamSchema,
  UpdateCommentBodySchema,
} from "@/src/features/comments/validation";
import { deleteComment, updateComment } from "@/src/features/comments/service";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, CommentIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  const body = await parseJson(req, UpdateCommentBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    const comment = await updateComment(prisma, session.user, parsedParams.data.id, body.data);
    return NextResponse.json(comment);
  } catch (error) {
    return toErrorResponse(error, "Failed to update comment.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, CommentIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  try {
    const session = await requireSession(prisma, req);
    await deleteComment(prisma, session.user, parsedParams.data.id);
    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete comment.");
  }
}
