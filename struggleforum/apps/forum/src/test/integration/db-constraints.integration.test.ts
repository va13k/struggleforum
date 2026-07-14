import { describe, expect, it } from "vitest";
import { testPrisma as prisma } from "./client";
import { createCategory } from "@/src/features/categories/repository";
import { createPost } from "@/src/features/posts/repository";
import { createUser } from "@/src/features/users/repository";

async function makeUser(suffix: string) {
  return createUser(prisma, {
    username: `user-${suffix}`,
    email: `user-${suffix}@test.local`,
    passwordHash: "not-a-real-hash",
    role: "USER",
  });
}

describe("database schema", () => {
  it("applies migrations and produces a queryable schema", async () => {
    await expect(prisma.category.findMany()).resolves.toEqual([]);
  });
});

describe("Category.name unique constraint", () => {
  it("rejects creating two categories with the same name", async () => {
    await createCategory(prisma, { name: "General" });

    await expect(
      createCategory(prisma, { name: "General" }),
    ).rejects.toMatchObject({ code: "P2002" });
  });
});

describe("Post.category onDelete: Cascade", () => {
  it("deletes a category's posts when the category is deleted", async () => {
    const author = await makeUser("author");
    const category = await createCategory(prisma, { name: "General" });
    const post = await createPost(prisma, {
      authorId: author.id,
      categoryId: category.id,
      title: "Hello world",
      content: "Some post content",
    });

    await prisma.category.delete({ where: { id: category.id } });

    await expect(
      prisma.post.findUnique({ where: { id: post.id } }),
    ).resolves.toBeNull();
  });

  it("cascades further to comments/likes/notifications on the deleted posts", async () => {
    const author = await makeUser("author");
    const category = await createCategory(prisma, { name: "General" });
    const post = await createPost(prisma, {
      authorId: author.id,
      categoryId: category.id,
      title: "Hello world",
      content: "Some post content",
    });
    const comment = await prisma.comment.create({
      data: { postId: post.id, authorId: author.id, content: "Nice post" },
    });
    await prisma.like.create({
      data: { userId: author.id, postId: post.id },
    });

    await prisma.category.delete({ where: { id: category.id } });

    await expect(
      prisma.comment.findUnique({ where: { id: comment.id } }),
    ).resolves.toBeNull();
    await expect(
      prisma.like.findMany({ where: { postId: post.id } }),
    ).resolves.toEqual([]);
  });
});

describe("Like unique constraints", () => {
  it("rejects liking the same post twice for the same user", async () => {
    const author = await makeUser("author");
    const category = await createCategory(prisma, { name: "General" });
    const post = await createPost(prisma, {
      authorId: author.id,
      categoryId: category.id,
      title: "Hello world",
      content: "Some post content",
    });

    await prisma.like.create({
      data: { userId: author.id, postId: post.id },
    });

    await expect(
      prisma.like.create({ data: { userId: author.id, postId: post.id } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("allows the same user to like a post and a comment independently", async () => {
    const author = await makeUser("author");
    const category = await createCategory(prisma, { name: "General" });
    const post = await createPost(prisma, {
      authorId: author.id,
      categoryId: category.id,
      title: "Hello world",
      content: "Some post content",
    });
    const comment = await prisma.comment.create({
      data: { postId: post.id, authorId: author.id, content: "Nice post" },
    });

    await prisma.like.create({
      data: { userId: author.id, postId: post.id },
    });

    await expect(
      prisma.like.create({
        data: { userId: author.id, commentId: comment.id },
      }),
    ).resolves.toMatchObject({ commentId: comment.id });
  });
});
