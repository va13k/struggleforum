import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, PUT } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as commentService from "@/src/features/comments/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/comments/service", () => ({ updateComment: vi.fn(), deleteComment: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

const COMMENT_ID = "c4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/comments/[id] route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates a comment", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(commentService.updateComment).mockResolvedValue({ id: COMMENT_ID } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.comments.item(COMMENT_ID)}`, {
      method: "PUT",
      body: JSON.stringify({ content: "Updated" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PUT(req, { params: { id: COMMENT_ID } });

    expect(res.status).toBe(200);
  });

  it("deletes a comment", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.comments.item(COMMENT_ID)}`, {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: { id: COMMENT_ID } });

    expect(res.status).toBe(200);
  });
});
