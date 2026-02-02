import type { PrismaClient } from "@prisma/client/extension";
import {
  CreateUserBodySchema,
  UpdateUserBodySchema,
} from "@/src/server/validation/users";

export async function listUsers(prisma: PrismaClient) {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, country: true },
  });
}

export async function listUser(prisma: PrismaClient, id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { posts: true, profile: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function createUser(prisma: PrismaClient, input: unknown) {
  const data = CreateUserBodySchema.parse(input);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role || "USER",
      country: data.country,
    },
  });
}

export async function updateUser(
  prisma: PrismaClient,
  id: string,
  input: unknown,
) {
  const data = UpdateUserBodySchema.parse(input);
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(prisma: PrismaClient, id: string) {
  return prisma.user.delete({ where: { id } });
}
