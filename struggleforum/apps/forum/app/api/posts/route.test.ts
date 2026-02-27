import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import * as postService from "@/src/features/posts/service";
import { prisma } from "@/src/server/db/prisma";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/posts/service", () => ({
  listPosts: vi.fn(),
  createPost: vi.fn(),
}));

describe("/api/posts route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET returns posts", async () => {
    const posts = [
      {
        id: "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a",
        authorId: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
        categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
        title: "Test post title",
        content: "Valid test content for this post entry.",
        locked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(postService.listPosts).mockResolvedValue(posts as any);

    const req = new NextRequest("http://localhost:3000/api/posts");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(postService.listPosts).toHaveBeenCalledWith(prisma);
    expect(json).toEqual([
      {
        ...posts[0],
        createdAt: posts[0]!.createdAt.toISOString(),
        updatedAt: posts[0]!.updatedAt.toISOString(),
      },
    ]);
  });

  it("GET returns 500 when service throws", async () => {
    vi.mocked(postService.listPosts).mockRejectedValue(new Error("boom"));

    const req = new NextRequest("http://localhost:3000/api/posts");
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toBe("Failed to fetch posts");
  });

  it("POST creates a post and returns 201", async () => {
    const payload = {
      authorId: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "New post title",
      content: "This is valid content for creating a post.",
      locked: false,
    };
    const createdPost = {
      id: "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a",
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(postService.createPost).mockResolvedValue(createdPost as any);

    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(postService.createPost).toHaveBeenCalledWith(prisma, payload);
    expect(json).toEqual({
      ...createdPost,
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    });
  });

  it("POST returns 400 on invalid body", async () => {
    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({ title: "x" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(postService.createPost).not.toHaveBeenCalled();
  });

  it("POST returns 400 on invalid json", async () => {
    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: "{this is not valid json",
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Invalid JSON" });
    expect(postService.createPost).not.toHaveBeenCalled();
  });

  it("POST returns 500 when service throws", async () => {
    const payload = {
      authorId: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "New post title",
      content: "This is valid content for creating a post.",
      locked: false,
    };
    vi.mocked(postService.createPost).mockRejectedValue(new Error("boom"));

    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: "Failed to create a new post" });
  });
});
