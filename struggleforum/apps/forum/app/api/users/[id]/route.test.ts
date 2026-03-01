import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as userService from "@/src/features/users/service";
import * as sessionModule from "@/src/server/auth/session";
import { makePublicUser, makeSession, makeUser } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/users/service", () => ({
  getUserById: vi.fn(),
  getUserWithPosts: vi.fn(),
  getUserWithComments: vi.fn(),
  getUserSessions: vi.fn(),
}));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn(), requireSelfOrAdmin: vi.fn() };
});

const USER_ID = "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6";

describe("/api/users/[id] route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a public user resource", async () => {
    vi.mocked(userService.getUserById).mockResolvedValue(
      makePublicUser() as any,
    );

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.users.item(USER_ID)}`), {
      params: { id: USER_ID },
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).not.toHaveProperty("email");
  });

  it("returns 400 for invalid include values", async () => {
    const res = await GET(
      new NextRequest(`http://localhost:3000${apiRoutes.users.item(USER_ID)}?include=likes`),
      { params: { id: USER_ID } },
    );

    expect(res.status).toBe(400);
  });

  it("returns user posts when include=posts", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(makeSession() as any);
    vi.mocked(userService.getUserWithPosts).mockResolvedValue({
      ...makePublicUser(),
      posts: [],
    } as any);

    const res = await GET(
      new NextRequest(`http://localhost:3000${apiRoutes.users.item(USER_ID)}?include=posts`),
      { params: { id: USER_ID } },
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).not.toHaveProperty("email");
  });

  it("guards include=sessions behind self-or-admin", async () => {
    vi.mocked(sessionModule.requireSession).mockResolvedValue(makeSession() as any);
    vi.mocked(userService.getUserSessions).mockResolvedValue({
      ...makeUser(),
      sessions: [],
    } as any);

    const res = await GET(
      new NextRequest(`http://localhost:3000${apiRoutes.users.item(USER_ID)}?include=sessions`),
      { params: { id: USER_ID } },
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.email).toBeDefined();
    expect(sessionModule.requireSelfOrAdmin).toHaveBeenCalled();
  });
});
