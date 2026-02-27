import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET, PUT } from "./route";
import * as postService from "@/src/features/posts/service";
import { prisma } from "@/src/server/db/prisma";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/posts/service", () => ({
  getPostById: vi.fn(),
  getPostByIdWithRelations: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

const VALID_POST_ID = "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";
const INVALID_POST_ID = "not-a-uuid";

describe("/api/posts/[id] route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET returns 400 for invalid id params", async () => {
    const req = new NextRequest("http://localhost:3000/api/posts/not-a-uuid");
    const res = await GET(req, { params: { id: INVALID_POST_ID } });

    expect(res.status).toBe(400);
    expect(postService.getPostById).not.toHaveBeenCalled();
    expect(postService.getPostByIdWithRelations).not.toHaveBeenCalled();
  });

  it("GET returns post by id without relations by default", async () => {
    const post = {
      id: VALID_POST_ID,
      authorId: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "Post title",
      content: "This is valid test content for a forum post.",
      locked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(postService.getPostById).mockResolvedValue(post as any);

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
    );
    const res = await GET(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(200);
    expect(postService.getPostById).toHaveBeenCalledWith(prisma, VALID_POST_ID);
    expect(postService.getPostByIdWithRelations).not.toHaveBeenCalled();
  });

  it("GET returns post with relations when include=relations", async () => {
    const postWithRelations = {
      id: VALID_POST_ID,
      authorId: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "Post title",
      content: "This is valid test content for a forum post.",
      locked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        id: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
        username: "alice",
        email: "alice@test.com",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      category: {
        id: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
        name: "General",
        description: null,
        createdAt: new Date(),
      },
      _count: {
        likes: 0,
        comments: 0,
      },
    };
    vi.mocked(postService.getPostByIdWithRelations).mockResolvedValue(
      postWithRelations as any,
    );

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}?include=relations`,
    );
    const res = await GET(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(200);
    expect(postService.getPostByIdWithRelations).toHaveBeenCalledWith(
      prisma,
      VALID_POST_ID,
    );
    expect(postService.getPostById).not.toHaveBeenCalled();
  });

  it("GET returns 404 when post does not exist", async () => {
    vi.mocked(postService.getPostById).mockResolvedValue(null);

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
    );
    const res = await GET(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Post not found" });
  });

  it("GET returns 500 when service throws generic error", async () => {
    vi.mocked(postService.getPostById).mockRejectedValue(new Error("boom"));

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
    );
    const res = await GET(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "boom" });
  });

  it("GET returns 404 when service throws Post not found", async () => {
    vi.mocked(postService.getPostById).mockRejectedValue(
      new Error("Post not found"),
    );

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
    );
    const res = await GET(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Post not found" });
  });

  it("PUT returns 400 for invalid id params", async () => {
    const req = new NextRequest("http://localhost:3000/api/posts/not-a-uuid", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated title" }),
      headers: { "content-type": "application/json" },
    });
    const res = await PUT(req, { params: { id: INVALID_POST_ID } });

    expect(res.status).toBe(400);
    expect(postService.updatePost).not.toHaveBeenCalled();
  });

  it("PUT returns 400 for invalid body", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
      {
        method: "PUT",
        body: JSON.stringify({ title: "x" }),
        headers: { "content-type": "application/json" },
      },
    );
    const res = await PUT(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(400);
    expect(postService.updatePost).not.toHaveBeenCalled();
  });

  it("PUT updates post and returns 200", async () => {
    const payload = {
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "Updated valid title",
    };
    const updatedPost = {
      id: VALID_POST_ID,
      authorId: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "Updated valid title",
      content: "This is valid test content for a forum post.",
      locked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(postService.updatePost).mockResolvedValue(updatedPost as any);

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
      },
    );
    const res = await PUT(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(200);
    expect(postService.updatePost).toHaveBeenCalledWith(
      prisma,
      VALID_POST_ID,
      payload,
    );
  });

  it("PUT returns 500 when service throws", async () => {
    const payload = {
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "Updated valid title",
    };
    vi.mocked(postService.updatePost).mockRejectedValue(new Error("boom"));

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
      },
    );
    const res = await PUT(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to update post." });
  });

  it("DELETE returns 400 for invalid id params", async () => {
    const req = new NextRequest("http://localhost:3000/api/posts/not-a-uuid", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: { id: INVALID_POST_ID } });

    expect(res.status).toBe(400);
    expect(postService.deletePost).not.toHaveBeenCalled();
  });

  it("DELETE removes post and returns 200", async () => {
    vi.mocked(postService.deletePost).mockResolvedValue({} as any);

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
      {
        method: "DELETE",
      },
    );
    const res = await DELETE(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(200);
    expect(postService.deletePost).toHaveBeenCalledWith(prisma, VALID_POST_ID);
    expect(await res.json()).toEqual({
      message: `Post with id: ${VALID_POST_ID} deleted`,
    });
  });

  it("DELETE returns 500 when service throws", async () => {
    vi.mocked(postService.deletePost).mockRejectedValue(new Error("boom"));

    const req = new NextRequest(
      `http://localhost:3000/api/posts/${VALID_POST_ID}`,
      {
        method: "DELETE",
      },
    );
    const res = await DELETE(req, { params: { id: VALID_POST_ID } });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to delete post." });
  });
});
