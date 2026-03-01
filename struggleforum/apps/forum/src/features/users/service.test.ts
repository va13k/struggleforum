import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getUserById,
  getUserByUsername,
  getUserSessions,
  getUserWithComments,
  getUserWithPosts,
  updateOwnProfile,
  updateUserRole,
} from "./service";
import * as userRepository from "./repository";
import { Role } from "@prisma/client";
import { makePublicUser, makeUser } from "@/src/test/factories";

vi.mock("./repository", () => ({
  getUserById: vi.fn(),
  getUserByUsername: vi.fn(),
  getUserWithPosts: vi.fn(),
  getUserWithComments: vi.fn(),
  getUserSessions: vi.fn(),
  updateUser: vi.fn(),
}));

describe("users service", () => {
  const baseUser = makePublicUser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets user by id", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.getUserById).mockResolvedValue(baseUser as any);

    const result = await getUserById(prisma, baseUser.id);

    expect(userRepository.getUserById).toHaveBeenCalledWith(prisma, baseUser.id);
    expect(result).toEqual(baseUser);
  });

  it("gets user by username", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.getUserByUsername).mockResolvedValue(baseUser as any);

    const result = await getUserByUsername(prisma, baseUser.username);

    expect(userRepository.getUserByUsername).toHaveBeenCalledWith(
      prisma,
      baseUser.username,
    );
    expect(result).toEqual(baseUser);
  });

  it("gets user with posts", async () => {
    const prisma = {} as any;
    const userWithPosts = { ...baseUser, posts: [] };
    vi.mocked(userRepository.getUserWithPosts).mockResolvedValue(userWithPosts as any);

    const result = await getUserWithPosts(prisma, baseUser.id);

    expect(userRepository.getUserWithPosts).toHaveBeenCalledWith(prisma, baseUser.id);
    expect(result).toEqual(userWithPosts);
  });

  it("gets user with comments", async () => {
    const prisma = {} as any;
    const userWithComments = { ...baseUser, comments: [] };
    vi.mocked(userRepository.getUserWithComments).mockResolvedValue(
      userWithComments as any,
    );

    const result = await getUserWithComments(prisma, baseUser.id);

    expect(userRepository.getUserWithComments).toHaveBeenCalledWith(
      prisma,
      baseUser.id,
    );
    expect(result).toEqual(userWithComments);
  });

  it("gets user sessions", async () => {
    const prisma = {} as any;
    const userWithSessions = { ...makeUser(), sessions: [] };
    vi.mocked(userRepository.getUserSessions).mockResolvedValue(userWithSessions as any);

    const result = await getUserSessions(prisma, baseUser.id);

    expect(userRepository.getUserSessions).toHaveBeenCalledWith(prisma, baseUser.id);
    expect(result).toEqual(userWithSessions);
  });

  it("throws when user is not found", async () => {
    const prisma = {} as any;
    vi.mocked(userRepository.getUserById).mockResolvedValue(null);

    await expect(getUserById(prisma, baseUser.id)).rejects.toThrow("User not found");
  });

  it("updates own profile and normalizes fields", async () => {
    const prisma = {} as any;
    const updatedUser = makeUser({
      avatarUrl: "https://example.com/avatar.png",
    });
    vi.mocked(userRepository.updateUser).mockResolvedValue(updatedUser as any);

    const result = await updateOwnProfile(prisma, baseUser.id, {
      email: "Alice@Test.com",
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(userRepository.updateUser).toHaveBeenCalledWith(prisma, baseUser.id, {
      username: undefined,
      email: "alice@test.com",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(result).toEqual(updatedUser);
  });

  it("updates user role", async () => {
    const prisma = {} as any;
    const adminUser = makeUser({ role: Role.ADMIN });
    vi.mocked(userRepository.updateUser).mockResolvedValue(adminUser as any);

    const result = await updateUserRole(prisma, baseUser.id, { role: Role.ADMIN });

    expect(userRepository.updateUser).toHaveBeenCalledWith(prisma, baseUser.id, {
      role: Role.ADMIN,
    });
    expect(result).toEqual(adminUser);
  });
});
