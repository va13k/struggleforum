import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET, PUT } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as categoryService from "@/src/features/categories/service";
import * as sessionModule from "@/src/server/auth/session";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/src/server/http/errors";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/categories/service", () => ({
  getCategoryById: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<
    typeof import("@/src/server/auth/session")
  >("@/src/server/auth/session");
  return { ...actual, requireSession: vi.fn(), requireAdmin: vi.fn() };
});

const CATEGORY_ID = "b4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/categories/[id] route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a category by id", async () => {
    vi.mocked(categoryService.getCategoryById).mockResolvedValue({
      id: CATEGORY_ID,
    } as any);

    const res = await GET(
      new NextRequest(
        `http://localhost:3000${apiRoutes.categories.item(CATEGORY_ID)}`,
      ),
      { params: { id: CATEGORY_ID } },
    );

    expect(res.status).toBe(200);
  });

  it("returns 404 when the category does not exist", async () => {
    vi.mocked(categoryService.getCategoryById).mockRejectedValue(
      new NotFoundError("Category not found"),
    );

    const res = await GET(
      new NextRequest(
        `http://localhost:3000${apiRoutes.categories.item(CATEGORY_ID)}`,
      ),
      { params: { id: CATEGORY_ID } },
    );

    expect(res.status).toBe(404);
  });

  it("updates a category for admins", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(
      makeSession({ user: makeUser({ role: "ADMIN" }) }) as any,
    );
    vi.mocked(categoryService.updateCategory).mockResolvedValue({
      id: CATEGORY_ID,
    } as any);

    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.categories.item(CATEGORY_ID)}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: "Updated name" }),
        headers: { "content-type": "application/json" },
      },
    );

    const res = await PUT(req, { params: { id: CATEGORY_ID } });

    expect(res.status).toBe(200);
  });

  it("deletes a category for admins", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(
      makeSession({ user: makeUser({ role: "ADMIN" }) }) as any,
    );

    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.categories.item(CATEGORY_ID)}`,
      {
        method: "DELETE",
      },
    );

    const res = await DELETE(req, { params: { id: CATEGORY_ID } });

    expect(res.status).toBe(200);
    expect(categoryService.deleteCategory).toHaveBeenCalledWith(
      expect.anything(),
      CATEGORY_ID,
    );
  });

  it("returns 409 when deleting a category with existing posts", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(
      makeSession({ user: makeUser({ role: "ADMIN" }) }) as any,
    );
    vi.mocked(categoryService.deleteCategory).mockRejectedValue(
      new ConflictError("Cannot delete category with existing posts"),
    );

    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.categories.item(CATEGORY_ID)}`,
      {
        method: "DELETE",
      },
    );

    const res = await DELETE(req, { params: { id: CATEGORY_ID } });

    expect(res.status).toBe(409);
  });

  it("returns 403 for non-admin category update", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(
      makeSession() as any,
    );
    vi.mocked(sessionModule.requireAdmin).mockImplementation(() => {
      throw new ForbiddenError();
    });

    const req = new NextRequest(
      `http://localhost:3000${apiRoutes.categories.item(CATEGORY_ID)}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: "Updated name" }),
        headers: { "content-type": "application/json" },
      },
    );

    const res = await PUT(req, { params: { id: CATEGORY_ID } });

    expect(res.status).toBe(403);
  });
});
