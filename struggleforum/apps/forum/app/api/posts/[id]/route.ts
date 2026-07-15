import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth, withPublicRoute } from "@/src/server/auth/route-handlers";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import {
  deletePost,
  getPostById,
  updatePost,
} from "@/src/features/posts/service";
import {
  PostIdParamSchema,
  UpdatePostBodySchema,
} from "@/src/server/validation/posts";

export const GET = withPublicRoute<{ id: string }>(
  "Post detail is public read access.",
  async (_req, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, PostIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    try {
      const post = await getPostById(prisma, parsedParams.data.id);
      return NextResponse.json(post);
    } catch (error) {
      return toErrorResponse(error, "Failed to fetch post.");
    }
  },
);

export const PUT = withAuth<{ id: string }>(
  async (req: NextRequest, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, PostIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const body = await parseJson(req, UpdatePostBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const post = await updatePost(
      prisma,
      session.user,
      parsedParams.data.id,
      body.data,
    );
    return NextResponse.json(post);
  },
  { fallbackMessage: "Failed to update post." },
);

export const DELETE = withAuth<{ id: string }>(
  async (_req, session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, PostIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    await deletePost(prisma, session.user, parsedParams.data.id);
    return NextResponse.json({ message: "Post deleted successfully" });
  },
  { fallbackMessage: "Failed to delete post." },
);
