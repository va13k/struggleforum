import { describe, it, expect, vi } from "vitest";
import { createUser } from "./service";

describe("users service", () => {
  it("creates a user", async () => {
    const prisma = {
      user: {
        create: vi.fn().mockResolvedValue({
          id: "cku1234567890123456789012",
          name: "Alice",
          email: "alice@test.com",
          role: "USER",
          country: "Switzerland",
        }),
      },
    } as any;

    const user = await createUser(prisma, {
      name: "Alice",
      email: "alice@test.com",
      country: "Switzerland",
    });

    expect(prisma.user.create).toHaveBeenCalled();
    expect(user.id).toBeTruthy();
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("alice@test.com");
    expect(user.country).toBe("Switzerland");
  });

  it("rejects invalid email", async () => {
    const prisma = { user: { create: vi.fn() } } as any;

    await expect(
      createUser(prisma, { name: "Alice", email: "notemail1337" }),
    ).rejects.toBeTruthy();
  });
});
