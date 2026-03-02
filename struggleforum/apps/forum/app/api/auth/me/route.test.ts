import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as sessionModule from "@/src/server/auth/session";
import { UnauthorizedError } from "@/src/server/http/errors";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

describe("/api/auth/me route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the current user", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.auth.me}`);
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe(session.user.id);
  });

  it("returns 401 when unauthorized", async () => {
    vi.mocked(sessionModule.requireSession).mockRejectedValue(new UnauthorizedError());

    const req = new NextRequest(`http://localhost:3000${apiRoutes.auth.me}`);
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});
