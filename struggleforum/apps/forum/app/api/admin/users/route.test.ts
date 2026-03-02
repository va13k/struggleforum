import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as adminService from "@/src/features/admin/service";
import * as sessionModule from "@/src/server/auth/session";
import { ForbiddenError } from "@/src/server/http/errors";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/admin/service", () => ({ listAdminUsers: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn(), requireAdmin: vi.fn() };
});

describe("/api/admin/users route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns admin user list", async () => {
    const adminUsers = [makeUser()];
    vi.mocked(sessionModule.requireSession).mockResolvedValue(
      makeSession({ user: makeUser({ role: "ADMIN" }) }) as any,
    );
    vi.mocked(adminService.listAdminUsers).mockResolvedValue(adminUsers as any);

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.admin.users.collection}`));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data[0].email).toBe(adminUsers[0].email);
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(makeSession() as any);
    vi.mocked(sessionModule.requireAdmin).mockImplementation(() => {
      throw new ForbiddenError();
    });

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.admin.users.collection}`));

    expect(res.status).toBe(403);
  });
});
