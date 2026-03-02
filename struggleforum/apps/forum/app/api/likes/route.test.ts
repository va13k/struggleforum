import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as likeService from "@/src/features/likes/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/likes/service", () => ({ createLike: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

describe("/api/likes route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a like", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(makeSession() as any);
    vi.mocked(likeService.createLike).mockResolvedValue({ id: "like-1" } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.likes.collection}`, {
      method: "POST",
      body: JSON.stringify({ targetType: "post", targetId: "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
  });
});
