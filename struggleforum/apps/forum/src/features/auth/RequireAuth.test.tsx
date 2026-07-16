// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import RequireAuth from "./RequireAuth";
import { apiFetch, ApiError } from "@/src/lib/api-client";

vi.mock("@/src/lib/api-client", async () => {
  const actual =
    await vi.importActual<typeof import("@/src/lib/api-client")>(
      "@/src/lib/api-client",
    );
  return { ...actual, apiFetch: vi.fn() };
});

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const mockedApiFetch = vi.mocked(apiFetch);

function GuardedPage() {
  return (
    <RequireAuth>
      <div data-testid="secret">secret content</div>
    </RequireAuth>
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
    replace.mockReset();
  });

  it("redirects to /login when logged out", async () => {
    mockedApiFetch.mockRejectedValueOnce(
      new ApiError(401, "Authentication required"),
    );

    render(
      <AuthProvider>
        <GuardedPage />
      </AuthProvider>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByTestId("secret")).not.toBeInTheDocument();
  });

  it("renders the guarded content when logged in", async () => {
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
        <GuardedPage />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("secret")).toBeInTheDocument(),
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
