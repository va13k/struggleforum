// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const login = vi.fn();
let mockStatus: "loading" | "authenticated" | "unauthenticated" =
  "unauthenticated";

vi.mock("@/src/features/auth/AuthProvider", () => ({
  useAuth: () => ({ login, status: mockStatus }),
}));

describe("Login page", () => {
  beforeEach(() => {
    replace.mockReset();
    login.mockReset();
    mockStatus = "unauthenticated";
  });

  it("redirects to / when already authenticated", () => {
    mockStatus = "authenticated";
    render(<Login />);

    expect(replace).toHaveBeenCalledWith("/");
  });

  it("does not redirect while unauthenticated", () => {
    render(<Login />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("blocks submission when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(login).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("submits the typed credentials and redirects to / on success", async () => {
    login.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<Login />);

    await user.type(
      screen.getByLabelText(/enter your email address/i),
      "yuki@example.com",
    );
    await user.type(screen.getByLabelText(/enter password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(login).toHaveBeenCalledWith("yuki@example.com", "password123");
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("shows the backend's generic error message on invalid credentials", async () => {
    login.mockRejectedValueOnce(new Error("Invalid email or password"));
    const user = userEvent.setup();
    render(<Login />);

    await user.type(
      screen.getByLabelText(/enter your email address/i),
      "yuki@example.com",
    );
    await user.type(screen.getByLabelText(/enter password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
