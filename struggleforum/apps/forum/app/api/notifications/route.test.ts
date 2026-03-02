import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as notificationService from "@/src/features/notifications/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/notifications/service", () => ({ listNotifications: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

describe("/api/notifications route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns notifications for the current user", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(notificationService.listNotifications).mockResolvedValue([] as any);

    const res = await GET(new NextRequest(`http://localhost:3000${apiRoutes.notifications.collection}`));

    expect(res.status).toBe(200);
  });
});
