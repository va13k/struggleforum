import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSelfOrAdmin, requireSession } from "@/src/server/auth/session";
import { toErrorResponse } from "@/src/server/http/errors";
import { parseParams, resolveRouteParams } from "@/src/server/http/validation";
import {
  getUserById,
  getUserSessions,
  getUserWithComments,
  getUserWithPosts,
} from "@/src/features/users/service";
import {
  UserIdParamSchema,
  UserIncludeQuerySchema,
} from "@/src/server/validation/users";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, UserIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  const include = req.nextUrl.searchParams.get("include");
  const relation = include
    ? UserIncludeQuerySchema.safeParse(include)
    : { success: true as const, data: undefined };

  if (!relation.success) {
    return NextResponse.json(
      { error: "Invalid include query parameter", issues: relation.error },
      { status: 400 },
    );
  }

  try {
    if (!relation.data) {
      const user = await getUserById(prisma, parsedParams.data.id);
      return NextResponse.json(user);
    }

    const session = await requireSession(prisma, req);

    if (relation.data === "sessions") {
      requireSelfOrAdmin(session, parsedParams.data.id);
      const user = await getUserSessions(prisma, parsedParams.data.id);
      return NextResponse.json(user);
    }

    if (relation.data === "posts") {
      const user = await getUserWithPosts(prisma, parsedParams.data.id);
      return NextResponse.json(user);
    }

    const user = await getUserWithComments(prisma, parsedParams.data.id);
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch user.");
  }
}
