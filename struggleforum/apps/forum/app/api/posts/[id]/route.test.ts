import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET, PUT } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as postService from "@/src/features/posts/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/posts/service", () => ({
  getPostById: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

const POST_ID = "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/posts/[id] route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a post by id", async () => {
    vi.mocked(postService.getPostById).mockResolvedValue({ id: POST_ID } as any);

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.posts.item(POST_ID)}`), {
      params: { id: POST_ID },
    });

    expect(res.status).toBe(200);
  });

  it("updates a post for the current actor", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(postService.updatePost).mockResolvedValue({ id: POST_ID } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.posts.item(POST_ID)}`, {
      method: "PUT",
      body: JSON.stringify({ title: "Updated title" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PUT(req, { params: { id: POST_ID } });

    expect(res.status).toBe(200);
    expect(postService.updatePost).toHaveBeenCalledWith(
      expect.anything(),
      session.user,
      POST_ID,
      { title: "Updated title" },
    );
  });

  it("deletes a post for the current actor", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.posts.item(POST_ID)}`, {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: { id: POST_ID } });

    expect(res.status).toBe(200);
    expect(postService.deletePost).toHaveBeenCalledWith(expect.anything(), session.user, POST_ID);
  });
});
