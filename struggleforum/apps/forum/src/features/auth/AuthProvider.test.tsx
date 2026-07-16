// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthProvider";
import { apiFetch, ApiError } from "@/src/lib/api-client";

vi.mock("@/src/lib/api-client", async () => {
  const actual =
    await vi.importActual<typeof import("@/src/lib/api-client")>(
      "@/src/lib/api-client",
    );
  return { ...actual, apiFetch: vi.fn() };
});

const mockedApiFetch = vi.mocked(apiFetch);

function Probe() {
  const { status, user } = useAuth();
  return <div data-testid="probe">{`${status}:${user?.username ?? "none"}`}</div>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it("becomes authenticated when GET /api/auth/me succeeds", async () => {
    mockedApiFetch.mockResolvedValueOnce({
      id: "user-1",
      username: "yuki",
      email: "yuki@example.com",
      avatarUrl: null,
      role: "USER",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("probe")).toHaveTextContent(
        "authenticated:yuki",
      ),
    );
  });

  it("becomes unauthenticated on a 401 with no session", async () => {
    mockedApiFetch.mockRejectedValueOnce(
      new ApiError(401, "Authentication required"),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("probe")).toHaveTextContent(
        "unauthenticated:none",
      ),
    );
  });

  it("becomes unauthenticated on a 401 with an expired session", async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError(401, "Session expired"));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("probe")).toHaveTextContent(
        "unauthenticated:none",
      ),
    );
  });
});
