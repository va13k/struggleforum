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
  deletePost,
  getPostById,
  updatePost,
} from "@/src/features/posts/service";
import {
  PostIdParamSchema,
  UpdatePostBodySchema,
} from "@/src/server/validation/posts";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
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
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, PostIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  const body = await parseJson(req, UpdatePostBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    const post = await updatePost(
      prisma,
      session.user,
      parsedParams.data.id,
      body.data,
    );
    return NextResponse.json(post);
  } catch (error) {
    return toErrorResponse(error, "Failed to update post.");
  }
}

export async function DELETE(
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
    await deletePost(prisma, session.user, parsedParams.data.id);
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete post.");
  }
}
