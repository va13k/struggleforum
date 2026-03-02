import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as postService from "@/src/features/posts/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/posts/service", () => ({ setPostLocked: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

const POST_ID = "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/posts/[id]/unlock route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unlocks a post for an admin", async () => {
    const session = makeSession({ user: makeUser({ role: "ADMIN" }) });
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(postService.setPostLocked).mockResolvedValue({
      id: POST_ID,
      locked: false,
    } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.posts.unlock(POST_ID)}`, {
      method: "POST",
    });

    const res = await POST(req, { params: { id: POST_ID } });

    expect(res.status).toBe(200);
    expect(postService.setPostLocked).toHaveBeenCalledWith(
      expect.anything(),
      session.user,
      POST_ID,
      false,
    );
  });
});
