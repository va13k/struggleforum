import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "./service";
import * as userRepository from "./repository";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}));

vi.mock("./repository", () => ({
  listUsers: vi.fn(),
  getUserById: vi.fn(),
  getUserByUsername: vi.fn(),
  getUserWithPosts: vi.fn(),
  getUserWithComments: vi.fn(),
  getUserSessions: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

describe("users service", () => {
  const baseUser = {
    id: "2ad7fbc0-72ad-4b7c-96e8-2388b1a2860a",
    username: "alice",
    email: "alice@test.com",
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user with hashed password", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.createUser).mockResolvedValue(baseUser);

    const user = await createUser(prisma, {
      username: "alice",
      email: "alice@test.com",
      password: "password123",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(userRepository.createUser).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        username: "alice",
        email: "alice@test.com",
        passwordHash: "hashed-password",
        role: Role.USER,
      }),
    );
    expect(user).toEqual(baseUser);
  });

  it("rejects invalid email", async () => {
    const prisma = {} as any;

    await expect(
      createUser(prisma, {
        username: "alice",
        email: "notemail1337",
        password: "password123",
      }),
    ).rejects.toBeTruthy();
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  it("lists users via repository", async () => {
    const prisma = {} as any;
    const users = [baseUser];
    vi.mocked(userRepository.listUsers).mockResolvedValue(users);

    const result = await listUsers(prisma);

    expect(userRepository.listUsers).toHaveBeenCalledWith(prisma);
    expect(result).toEqual(users);
  });

  it("gets user by id", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.getUserById).mockResolvedValue(baseUser);

    const result = await getUser(prisma, { id: baseUser.id });

    expect(userRepository.getUserById).toHaveBeenCalledWith(
      prisma,
      baseUser.id,
    );
    expect(result).toEqual(baseUser);
  });

  it("gets user by username", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.getUserByUsername).mockResolvedValue(baseUser);

    const result = await getUser(prisma, { username: baseUser.username });

    expect(userRepository.getUserByUsername).toHaveBeenCalledWith(
      prisma,
      baseUser.username,
    );
    expect(result).toEqual(baseUser);
  });

  it("gets user with posts when relation is posts", async () => {
    const prisma = {} as any;
    const userWithPosts = { ...baseUser, posts: [] as any[] };
    vi.mocked(userRepository.getUserWithPosts).mockResolvedValue(userWithPosts);

    const result = await getUser(prisma, { id: baseUser.id }, "posts");

    expect(userRepository.getUserWithPosts).toHaveBeenCalledWith(
      prisma,
      baseUser.id,
    );
    expect(result).toEqual(userWithPosts);
  });

  it("throws when user is not found", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.getUserById).mockResolvedValue(null);

    await expect(getUser(prisma, { id: baseUser.id })).rejects.toThrow(
      "User not found",
    );
  });

  it("updates user without password does not hash", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.updateUser).mockResolvedValue(baseUser);

    const result = await updateUser(prisma, baseUser.id, {
      email: "bob@test.com",
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userRepository.updateUser).toHaveBeenCalledWith(
      prisma,
      baseUser.id,
      {
        username: undefined,
        email: "bob@test.com",
        role: Role.USER,
      },
    );
    expect(result).toEqual(baseUser);
  });

  it("updates user with password hashes and passes passwordHash", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.updateUser).mockResolvedValue(baseUser);

    const result = await updateUser(prisma, baseUser.id, {
      password: "password123",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(userRepository.updateUser).toHaveBeenCalledWith(
      prisma,
      baseUser.id,
      {
        username: undefined,
        email: undefined,
        role: Role.USER,
        passwordHash: "hashed-password",
      },
    );
    expect(result).toEqual(baseUser);
  });

  it("deletes user via repository", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.deleteUser).mockResolvedValue(baseUser);

    const result = await deleteUser(prisma, baseUser.id);

    expect(userRepository.deleteUser).toHaveBeenCalledWith(prisma, baseUser.id);
    expect(result).toEqual(baseUser);
  });
});
