import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as authService from "@/src/features/auth/service";
import { UnauthorizedError } from "@/src/server/http/errors";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/auth/service", () => ({ login: vi.fn() }));

describe("/api/auth/login route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logs in a user", async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: "token" } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.auth.login}`, {
      method: "POST",
      body: JSON.stringify({ email: "alice@test.com", password: "password123" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
  });

  it("returns 401 for invalid credentials", async () => {
    vi.mocked(authService.login).mockRejectedValue(new UnauthorizedError("Invalid email or password"));

    const req = new NextRequest(`http://localhost:3000${apiRoutes.auth.login}`, {
      method: "POST",
      body: JSON.stringify({ email: "alice@test.com", password: "password123" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});
