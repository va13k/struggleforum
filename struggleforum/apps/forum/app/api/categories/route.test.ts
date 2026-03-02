import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as categoryService from "@/src/features/categories/service";
import * as sessionModule from "@/src/server/auth/session";
import { ForbiddenError } from "@/src/server/http/errors";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/categories/service", () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
}));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn(), requireAdmin: vi.fn() };
});

describe("/api/categories route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns categories", async () => {
    vi.mocked(categoryService.listCategories).mockResolvedValue([] as any);

    const res = await GET();

    expect(res.status).toBe(200);
  });

  it("creates a category for admins", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(
      makeSession({ user: makeUser({ role: "ADMIN" }) }) as any,
    );
    vi.mocked(categoryService.createCategory).mockResolvedValue({ id: "category-1" } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.categories.collection}`, {
      method: "POST",
      body: JSON.stringify({ name: "General" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
  });

  it("returns 403 for non-admin category creation", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(makeSession() as any);
    vi.mocked(sessionModule.requireAdmin).mockImplementation(() => {
      throw new ForbiddenError();
    });

    const req = new NextRequest(`http://localhost:3000${apiRoutes.categories.collection}`, {
      method: "POST",
      body: JSON.stringify({ name: "General" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);

    expect(res.status).toBe(403);
  });
});
