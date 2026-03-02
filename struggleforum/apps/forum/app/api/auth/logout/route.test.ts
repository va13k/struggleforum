import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as authService from "@/src/features/auth/service";
import * as sessionModule from "@/src/server/auth/session";
import { UnauthorizedError } from "@/src/server/http/errors";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/auth/service", () => ({ logout: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

describe("/api/auth/logout route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logs out the current session", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(makeSession() as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.auth.logout}`, {
      method: "POST",
      headers: { authorization: "Bearer token" },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(authService.logout).toHaveBeenCalledWith(expect.anything(), "session-token");
  });

  it("returns 401 without a valid session", async () => {
    vi.mocked(sessionModule.requireSession).mockRejectedValue(new UnauthorizedError());

    const req = new NextRequest(`http://localhost:3000${apiRoutes.auth.logout}`, {
      method: "POST",
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});
