import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAdmin, withPublicRoute } from "@/src/server/auth/route-handlers";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import {
  createCategory,
  listCategories,
} from "@/src/features/categories/service";
import { CreateCategoryBodySchema } from "@/src/features/categories/validation";

export const GET = withPublicRoute(
  "Category list is public read access.",
  async () => {
    try {
      const categories = await listCategories(prisma);
      return NextResponse.json({ categories });
    } catch (error) {
      return toErrorResponse(error, "Failed to fetch categories.");
    }
  },
);

export const POST = withAdmin(
  async (req: NextRequest) => {
    const body = await parseJson(req, CreateCategoryBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const category = await createCategory(prisma, body.data);
    return NextResponse.json(category, { status: 201 });
  },
  { fallbackMessage: "Failed to create category." },
);
