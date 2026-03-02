import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PUT } from "./route";
import { apiRoutes } from "@/src/lib/api-routes";
import * as notificationService from "@/src/features/notifications/service";
import * as sessionModule from "@/src/server/auth/session";
import { makeSession } from "@/src/test/factories";

vi.mock("@/src/server/db/prisma", () => ({ prisma: {} }));
vi.mock("@/src/features/notifications/service", () => ({ markNotificationRead: vi.fn() }));
vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );
  return { ...actual, requireSession: vi.fn() };
});

const NOTIFICATION_ID = "e4cadf12-8dc8-4f15-8ce8-3f2ec7107d9a";

describe("/api/notifications/[id]/read route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks a notification as read", async () => {
    const session = makeSession();
    vi.mocked(sessionModule.requireSession).mockResolvedValue(session as any);
    vi.mocked(notificationService.markNotificationRead).mockResolvedValue({ id: NOTIFICATION_ID } as any);

    const req = new NextRequest(`http://localhost:3000${apiRoutes.notifications.markRead(NOTIFICATION_ID)}`, {
      method: "PUT",
    });

    const res = await PUT(req, { params: { id: NOTIFICATION_ID } });

    expect(res.status).toBe(200);
  });
});
