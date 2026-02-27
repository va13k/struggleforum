import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import {
  UpdatePostBodySchema,
  PostIdParamSchema,
} from "@/src/server/validation/posts";
import { parseJson, parseParams } from "@/src/server/http/validation";
import {
  getPostById,
  getPostByIdWithRelations,
  deletePost,
  updatePost,
} from "@/src/features/posts/service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const p = parseParams(params, PostIdParamSchema);

  if (!p.ok) {
    return p.res;
  }

  try {
    const includeRelations =
      req.nextUrl.searchParams.get("include") === "relations";

    const post = includeRelations
      ? await getPostByIdWithRelations(prisma, p.data.id)
      : await getPostById(prisma, p.data.id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch post.";
    const status = message === "Post not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const p = parseParams(params, PostIdParamSchema);
  if (!p.ok) {
    return p.res;
  }

  const body = await parseJson(req, UpdatePostBodySchema);
  if (!body.ok) {
    return body.res;
  }

  try {
    const post = await updatePost(prisma, p.data.id, body.data);
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update post." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const p = parseParams(params, PostIdParamSchema);
  if (!p.ok) {
    return p.res;
  }

  try {
    await deletePost(prisma, p.data.id);
    return NextResponse.json(
      { message: `Post with id: ${params.id} deleted` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 },
    );
  }
}
