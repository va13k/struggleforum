export function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "0fd7f581-7e13-485b-8945-ddbf8cbb9dc6",
    username: "alice",
    email: "alice@test.com",
    avatarUrl: null,
    role: "USER",
    createdAt: new Date("2026-02-02T10:00:00.000Z"),
    updatedAt: new Date("2026-02-02T10:00:00.000Z"),
    ...overrides,
  };
}

export function makePublicUser(overrides: Record<string, unknown> = {}) {
  const { email: _email, ...user } = makeUser(overrides);
  return user;
}

export function makeSession(overrides: Record<string, unknown> = {}) {
  const user = makeUser();

  return {
    id: "sess-123",
    userId: user.id,
    token: "session-token",
    createdAt: new Date("2026-02-02T10:00:00.000Z"),
    lastActivity: new Date("2026-02-02T10:00:00.000Z"),
    expiresAt: new Date("2026-02-02T12:00:00.000Z"),
    user,
    ...overrides,
  };
}
