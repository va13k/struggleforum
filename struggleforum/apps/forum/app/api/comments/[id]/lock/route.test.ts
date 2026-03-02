import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as commentService from "@/src/features/comments/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/comments/service", () => ({ setCommentLocked: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

const COMMENT_ID = "c4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/comments/[id]/lock route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("locks a comment for the owner", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(commentService.setCommentLocked).mockResolvedValue({
      id: COMMENT_ID,
      locked: true,
    } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.comments.lock(COMMENT_ID)}`, {
      method: "POST",
    });

    const res = await POST(req, { params: { id: COMMENT_ID } });

    expect(res.status).toBe(200);
    expect(commentService.setCommentLocked).toHaveBeenCalledWith(
      expect.anything(),
      session.user,
      COMMENT_ID,
      true,
    );
  });
});
