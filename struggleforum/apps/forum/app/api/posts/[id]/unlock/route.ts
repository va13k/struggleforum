import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { setPostLocked } from "@/src/features/posts/service";
import { PostIdParamSchema } from "@/src/server/validation/posts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, PostIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  try {
    const session = await requireSession(prisma, req);
    const post = await setPostLocked(prisma, session.user, parsedParams.data.id, false);
    return NextResponse.json(post);
  } catch (error) {
    return toErrorResponse(error, "Failed to unlock post.");
  }
}
