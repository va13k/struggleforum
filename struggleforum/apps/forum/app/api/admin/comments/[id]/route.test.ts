import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as adminService from "@/src/features/admin/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/admin/service", () => ({ deleteComment: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn(), requireAdmin: vi.fn() };
});

const COMMENT_ID = "c4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/admin/comments/[id] route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a comment with a moderation reason", async () => {
    const session = makeSession({ user: makeUser({ role: "ADMIN" }) });
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);

    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.admin.comments.item(COMMENT_ID)}`,
      {
        method: "DELETE",
        body: JSON.stringify({ reason: "Contains prohibited promotion" }),
        headers: { "content-type": "application/json" },
      },
    );

    const res = await DELETE(req, { params: { id: COMMENT_ID } });

    expect(res.status).toBe(200);
    expect(adminService.deleteComment).toHaveBeenCalledWith(
      expect.anything(),
      session.user,
      COMMENT_ID,
      "Contains prohibited promotion",
    );
  });

  it("returns 400 when reason is missing", async () => {
    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.admin.comments.item(COMMENT_ID)}`,
      {
        method: "DELETE",
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
      },
    );

    const res = await DELETE(req, { params: { id: COMMENT_ID } });

    expect(res.status).toBe(400);
  });
});
