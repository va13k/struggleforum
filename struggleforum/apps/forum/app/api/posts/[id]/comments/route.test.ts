import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as commentService from "@/src/features/comments/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/comments/service", () => ({
  listCommentsByPost: vi.fn(),
  createComment: vi.fn(),
}));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

const POST_ID = "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/posts/[id]/comments route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns post comments", async () => {
    vi.mocked(commentService.listCommentsByPost).mockResolvedValue({ comments: [] } as any);

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.posts.comments(POST_ID)}`), {
      params: { id: POST_ID },
    });

    expect(res.status).toBe(200);
  });

  it("creates a comment", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(commentService.createComment).mockResolvedValue({ id: "comment-1" } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.posts.comments(POST_ID)}`, {
      method: "POST",
      body: JSON.stringify({ content: "Hello" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req, { params: { id: POST_ID } });

    expect(res.status).toBe(201);
  });
});
