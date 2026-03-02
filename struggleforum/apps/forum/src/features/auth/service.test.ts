import { beforeEach, describe, expect, it, vi } from "vitest";
import { register } from "./service";
import * as userRepository from "@/src/features/users/repository";
import * as authRepository from "./repository";
import * as sessionUtils from "@/src/server/auth/session";
import { makeSession, makeUser } from "@/src/test/factories";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("@/src/features/users/repository", () => ({
  createUser: vi.fn(),
  getUserAuthByEmail: vi.fn(),
  getUserAuthById: vi.fn(),
  getUserByUsername: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("./repository", () => ({
  createSession: vi.fn(),
  deleteSessionByToken: vi.fn(),
}));

vi.mock("@/src/server/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/src/server/auth/session")>(
    "@/src/server/auth/session",
  );

  return {
    ...actual,
    generateSessionToken: vi.fn(),
  };
});

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a user when email and username are available", async () => {
    const prisma = {} as any;
    const user = makeUser();
    const session = makeSession({ user });
    const bcrypt = await import("bcryptjs");

    vi.mocked(userRepository.getUserAuthByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.getUserByUsername).mockResolvedValue(null);
    vi.mocked(bcrypt.default.hash).mockResolvedValue("hashed-password" as never);
    vi.mocked(userRepository.createUser).mockResolvedValue(user as any);
    vi.mocked(sessionUtils.generateSessionToken).mockReturnValue("token");
    vi.mocked(authRepository.createSession).mockResolvedValue(session as any);

    const result = await register(prisma, {
      username: "alice",
      email: "Alice@Test.com",
      password: "password123",
    });

    expect(userRepository.getUserAuthByEmail).toHaveBeenCalledWith(
      prisma,
      "alice@test.com",
    );
    expect(userRepository.getUserByUsername).toHaveBeenCalledWith(prisma, "alice");
    expect(userRepository.createUser).toHaveBeenCalledWith(prisma, {
      username: "alice",
      email: "alice@test.com",
      avatarUrl: undefined,
      passwordHash: "hashed-password",
      role: "USER",
    });
    expect(authRepository.createSession).toHaveBeenCalled();
    expect(result).toEqual({ user, token: "token" });
  });

  it("rejects duplicate usernames", async () => {
    const prisma = {} as any;

    vi.mocked(userRepository.getUserAuthByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.getUserByUsername).mockResolvedValue(
      makeUser() as any,
    );

    await expect(
      register(prisma, {
        username: "alice",
        email: "alice@test.com",
        password: "password123",
      }),
    ).rejects.toThrow("Username is already in use");

    expect(userRepository.createUser).not.toHaveBeenCalled();
  });
});
