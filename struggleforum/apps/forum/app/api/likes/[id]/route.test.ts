import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as likeService from "@/src/features/likes/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/likes/service", () => ({ deleteLike: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

const LIKE_ID = "d4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/likes/[id] route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a like", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(makeSession() as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.likes.item(LIKE_ID)}`, {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: { id: LIKE_ID } });

    expect(res.status).toBe(200);
    expect(likeService.deleteLike).toHaveBeenCalled();
  });
});
