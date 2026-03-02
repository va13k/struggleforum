import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, PATCH } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as userService from "@/src/features/users/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/users/service", () => ({ updateOwnProfile: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

describe("/api/account/profile route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the current profile", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.account.profile}`));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.email).toBe(session.user.email);
  });

  it("updates the current profile", async () => {
    const session = makeSession();
    const updatedUser = makeUser({ username: "alice-updated" });
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(userService.updateOwnProfile).mockResolvedValue(updatedUser as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.account.profile}`, {
      method: "PATCH",
      body: JSON.stringify({ username: "alice-updated" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req);

    expect(res.status).toBe(200);
    expect(userService.updateOwnProfile).toHaveBeenCalledWith(
      expect.anything(),
      session.user.id,
      { username: "alice-updated" },
    );
  });
});
