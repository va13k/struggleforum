import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as postService from "@/src/features/posts/service";
import * as sessionModule from "@/src/server/auth/session";
import { UnauthorizedError } from "@/src/server/http/errors";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/posts/service", () => ({ listPosts: vi.fn(), createPost: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

describe("/api/posts route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns paginated posts", async () => {
    vi.mocked(postService.listPosts).mockResolvedValue({ posts: [], pagination: { page: 1, limit: 20, total: 0 } } as any);

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.posts.collection}`));

    expect(res.status).toBe(200);
  });

  it("returns 400 for invalid query params", async () => {
    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.posts.collection}?page=0`));

    expect(res.status).toBe(400);
  });

  it("creates a post for the current session user", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(postService.createPost).mockResolvedValue({ id: "post-1" } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.posts.collection}`, {
      method: "POST",
      body: JSON.stringify({
        categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
        title: "New post",
        content: "This is valid post content.",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(postService.createPost).toHaveBeenCalledWith(expect.anything(), session.user.id, {
      categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
      title: "New post",
      content: "This is valid post content.",
    });
  });

  it("returns 401 when creating a post without auth", async () => {
    vi.mocked(sessionModule.requireSession).mockRejectedValue(new UnauthorizedError());

    const req = new NextRequest(`http://localhost:3000${apiRoutes.posts.collection}`, {
      method: "POST",
      body: JSON.stringify({
        categoryId: "e68f7a5a-2115-4d67-af96-4d4b2bc95b5f",
        title: "New post",
        content: "This is valid post content.",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});
