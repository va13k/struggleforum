import { NextResponse, NextRequest } from "next/server";
import { createPost, listPosts } from "@/src/features/posts/service";
import { prisma } from "@/src/server/db/prisma";
import { parseJson } from "@/src/server/http/validation";
import { CreatePostBodySchema } from "@/src/server/validation/posts";

export async function GET(req: NextRequest) {
  try {
    const posts = await listPosts(prisma);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json("Failed to fetch posts", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await parseJson(req, CreatePostBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const post = await createPost(prisma, body.data);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create a new post" },
      { status: 500 },
    );
  }
}
