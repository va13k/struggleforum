import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as authService from "@/src/features/auth/service";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/auth/service", () => ({ register: vi.fn() }));

describe("/api/auth/register route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registers a user", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      user: { id: "user-1", username: "alice" },
      token: "token",
    } as any);

    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.auth.register}`,
      {
        method: "POST",
        body: JSON.stringify({
          username: "alice",
          email: "alice@test.com",
          password: "password123",
        }),
        headers: { "content-type": "application/json" },
      },
    );

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(authService.register).toHaveBeenCalled();
  });

  it("returns 400 for invalid input", async () => {
    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.auth.register}`,
      {
        method: "POST",
        body: JSON.stringify({ username: "ab" }),
        headers: { "content-type": "application/json" },
      },
    );

    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
