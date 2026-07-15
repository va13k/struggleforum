import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth, withPublicRoute } from "@/src/server/auth/route-handlers";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { CreateCommentBodySchema } from "@/src/features/comments/validation";
import {
  createComment,
  listCommentsByPost,
} from "@/src/features/comments/service";
import { PostIdParamSchema } from "@/src/server/validation/posts";

export const GET = withPublicRoute<{ id: string }>(
  "Comment list is public read access.",
  async (_req, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, PostIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    try {
      const comments = await listCommentsByPost(prisma, parsedParams.data.id);
      return NextResponse.json(comments);
    } catch (error) {
      return toErrorResponse(error, "Failed to fetch comments.");
    }
  },
);

export const POST = withAuth<{ id: string }>(
  async (req: NextRequest, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, PostIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const body = await parseJson(req, CreateCommentBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const comment = await createComment(
      prisma,
      {
        id: session.user.id,
        role: session.user.role,
        username: session.user.username,
      },
      parsedParams.data.id,
      body.data,
    );
    return NextResponse.json(comment, { status: 201 });
  },
  { fallbackMessage: "Failed to create comment." },
);
