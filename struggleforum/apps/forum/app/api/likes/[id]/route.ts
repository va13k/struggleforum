import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import { deleteLike } from "@/src/features/likes/service";
import { LikeIdParamSchema } from "@/src/features/likes/validation";

export const DELETE = withAuth<{ id: string }>(
  async (_req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, LikeIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    await deleteLike(prisma, session.user, parsedParams.data.id);
    return NextResponse.json({ message: "Like removed successfully" });
  },
  { fallbackMessage: "Failed to delete like." },
);
