import { describe, it, expect, vi } from "vitest";
import { createUser } from "./service";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}));

describe("users service", () => {
  it("creates a user", async () => {
    const prisma = {
      user: {
        create: vi.fn().mockResolvedValue({
          id: "2ad7fbc0-72ad-4b7c-96e8-2388b1a2860a",
          username: "alice",
          email: "alice@test.com",
          role: "USER",
        }),
      },
    } as any;

    const user = await createUser(prisma, {
      username: "alice",
      email: "alice@test.com",
      password: "password123",
    });

    expect(bcrypt.hash).toBeCalledWith("password123", 10);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(user.id).toBeTruthy();
    expect(user.username).toBe("alice");
    expect(user.email).toBe("alice@test.com");
  });

  it("finds all the created users");
  it("finds user by id");
  it("finds user by username");
  it("finds user with posts");
  it("finds user with sessions");
  it("finds user with comments");
  it("updates user fields");
  it("deletes user");

  it("hashes password before saving", async () => {
    const prisma = { user: { create: vi.fn().mockResolvedValue({}) } } as any;

    const user = await createUser(prisma, {
      username: "alice",
      email: "alice@test.com",
      password: "password123",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: "hashed-password",
        }),
      }),
    );
  });

  it("rejects invalid email", async () => {
    const prisma = { user: { create: vi.fn() } } as any;

    await expect(
      createUser(prisma, {
        username: "alice",
        email: "notemail1337",
        password: "password123",
      }),
    ).rejects.toBeTruthy();
  });
});
