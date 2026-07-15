import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAdmin, withPublicRoute } from "@/src/server/auth/route-handlers";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/src/features/categories/service";
import {
  CategoryIdParamSchema,
  UpdateCategoryBodySchema,
} from "@/src/features/categories/validation";

export const GET = withPublicRoute<{ id: string }>(
  "Category detail is public read access.",
  async (_req, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, CategoryIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    try {
      const category = await getCategoryById(prisma, parsedParams.data.id);
      return NextResponse.json(category);
    } catch (error) {
      return toErrorResponse(error, "Failed to fetch category.");
    }
  },
);

export const PUT = withAdmin<{ id: string }>(
  async (req: NextRequest, _session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, CategoryIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const body = await parseJson(req, UpdateCategoryBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const category = await updateCategory(
      prisma,
      parsedParams.data.id,
      body.data,
    );
    return NextResponse.json(category);
  },
  { fallbackMessage: "Failed to update category." },
);

export const DELETE = withAdmin<{ id: string }>(
  async (_req, _session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, CategoryIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const { deletedPostCount } = await deleteCategory(
      prisma,
      parsedParams.data.id,
    );
    return NextResponse.json({
      message: "Category deleted successfully",
      deletedPostCount,
    });
  },
  { fallbackMessage: "Failed to delete category." },
);
