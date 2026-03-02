import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { createPost, listPosts } from "@/src/features/posts/service";
import {
  CreatePostBodySchema,
  ListPostsQuerySchema,
} from "@/src/server/validation/posts";

export async function GET(req: NextRequest) {
  const query = ListPostsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );

  if (!query.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: query.error },
      { status: 400 },
    );
  }

  try {
    const posts = await listPosts(prisma, query.data);
    return NextResponse.json(posts);
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch posts.");
  }
}

export async function POST(req: NextRequest) {
  const body = await parseJson(req, CreatePostBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    const post = await createPost(prisma, session.user.id, body.data);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create a new post.");
  }
}
