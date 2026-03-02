import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { deleteLike } from "@/src/features/likes/service";
import { LikeIdParamSchema } from "@/src/features/likes/validation";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, LikeIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  try {
    const session = await requireSession(prisma, req);
    await deleteLike(prisma, session.user, parsedParams.data.id);
    return NextResponse.json({ message: "Like removed successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete like.");
  }
}
