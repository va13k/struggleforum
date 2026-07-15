import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAdmin } from "@/src/server/auth/route-handlers";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { PostIdParamSchema } from "@/src/server/validation/posts";
import { ModerationDeleteBodySchema } from "@/src/features/admin/validation";
import { deletePost } from "@/src/features/admin/service";

export const DELETE = withAdmin<{ id: string }>(
  async (req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, PostIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const body = await parseJson(req, ModerationDeleteBodySchema);

    if (!body.ok) {
      return body.res;
    }

    await deletePost(
      prisma,
      session.user as { id: string; role: "ADMIN" },
      parsedParams.data.id,
      body.data.reason,
    );
    return NextResponse.json({ message: "Post deleted successfully" });
  },
  { fallbackMessage: "Failed to delete post." },
);
