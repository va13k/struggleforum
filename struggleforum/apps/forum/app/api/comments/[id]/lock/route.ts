import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { setCommentLocked } from "@/src/features/comments/service";
import { CommentIdParamSchema } from "@/src/features/comments/validation";

export async function POST(
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
    const comment = await setCommentLocked(
      prisma,
      session.user,
      parsedParams.data.id,
      true,
    );
    return NextResponse.json(comment);
  } catch (error) {
    return toErrorResponse(error, "Failed to lock comment.");
  }
}
