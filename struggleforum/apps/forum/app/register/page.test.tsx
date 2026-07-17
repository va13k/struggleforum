// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const register = vi.fn();
let mockStatus: "loading" | "authenticated" | "unauthenticated" =
  "unauthenticated";

vi.mock("@/src/features/auth/AuthProvider", () => ({
  useAuth: () => ({ register, status: mockStatus }),
}));

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    email: string;
    confirmEmail: string;
    username: string;
    password: string;
    confirmPassword: string;
  }> = {},
) {
  const values = {
    email: "yuki@example.com",
    confirmEmail: "yuki@example.com",
    username: "yuki",
    password: "password123",
    confirmPassword: "password123",
    ...overrides,
  };

  if (values.email) {
    await user.type(
      screen.getByLabelText(/enter your email address/i),
      values.email,
    );
  }
  if (values.confirmEmail) {
    await user.type(
      screen.getByLabelText(/repeat your email address/i),
      values.confirmEmail,
    );
  }
  if (values.username) {
    await user.type(screen.getByLabelText(/choose your username/i), values.username);
  }
  if (values.password) {
    await user.type(screen.getByLabelText(/^enter password$/i), values.password);
  }
  if (values.confirmPassword) {
    await user.type(
      screen.getByLabelText(/repeat password/i),
      values.confirmPassword,
    );
  }
}

describe("Register page", () => {
  beforeEach(() => {
    replace.mockReset();
    register.mockReset();
    mockStatus = "unauthenticated";
  });

  it("redirects to / when already authenticated", () => {
    mockStatus = "authenticated";
    render(<Register />);

    expect(replace).toHaveBeenCalledWith("/");
  });

  it("does not redirect while unauthenticated", () => {
    render(<Register />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("blocks submission when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<Register />);

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(register).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows an inline error and blocks submission when the password is too short", async () => {
    const user = userEvent.setup();
    render(<Register />);

    await fillForm(user, { password: "short", confirmPassword: "short" });
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("shows an inline error and blocks submission when emails do not match", async () => {
    const user = userEvent.setup();
    render(<Register />);

    await fillForm(user, {
      email: "yuki@example.com",
      confirmEmail: "someone-else@example.com",
    });
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Email addresses do not match"),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("shows an inline error and blocks submission when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<Register />);

    await fillForm(user, {
      password: "password123",
      confirmPassword: "password456",
    });
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("submits the typed values and redirects to / on success", async () => {
    register.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<Register />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(register).toHaveBeenCalledWith({
      email: "yuki@example.com",
      username: "yuki",
      password: "password123",
    });
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("shows the server's error message when the email is already taken", async () => {
    register.mockRejectedValueOnce(new Error("Email is already in use"));
    const user = userEvent.setup();
    render(<Register />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Email is already in use"),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
