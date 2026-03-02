import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as authService from "@/src/features/auth/service";
import * as sessionModule from "@/src/server/auth/session";
import { UnauthorizedError } from "@/src/server/http/errors";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/auth/service", () => ({ updatePassword: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

describe("/api/account/password route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates the password", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.account.password}`, {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: "oldpass123", newPassword: "newpass123" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req);

    expect(res.status).toBe(200);
    expect(authService.updatePassword).toHaveBeenCalledWith(
      expect.anything(),
      session.user.id,
      { currentPassword: "oldpass123", newPassword: "newpass123" },
    );
  });

  it("returns 401 when the current password is wrong", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(authService.updatePassword).mockRejectedValue(
      new UnauthorizedError("Current password is incorrect"),
    );

    const req = new NextRequest(`http://localhost:3000${apiRoutes.account.password}`, {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: "oldpass123", newPassword: "newpass123" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });
});
