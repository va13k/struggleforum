import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as adminService from "@/src/features/admin/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/admin/service", () => ({ updateUserRole: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn(), requireAdmin: vi.fn() };
});

const USER_ID = "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6";

describe("/api/admin/users/[id]/role route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates a user role", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(
      makeSession({ user: makeUser({ role: "ADMIN" }) }) as any,
    );
    vi.mocked(adminService.updateUserRole).mockResolvedValue(makeUser({ role: "ADMIN" }) as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.admin.users.role(USER_ID)}`, {
      method: "PATCH",
      body: JSON.stringify({ role: "ADMIN" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req, { params: { id: USER_ID } });

    expect(res.status).toBe(200);
  });
});
