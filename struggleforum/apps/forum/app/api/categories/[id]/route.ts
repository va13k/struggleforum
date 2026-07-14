import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireAdmin, requireSession } from "@/src/server/auth/session";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
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
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, CategoryIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  const body = await parseJson(req, UpdateCategoryBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    requireAdmin(session);
    const category = await updateCategory(
      prisma,
      parsedParams.data.id,
      body.data,
    );
    return NextResponse.json(category);
  } catch (error) {
    return toErrorResponse(error, "Failed to update category.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, CategoryIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  try {
    const session = await requireSession(prisma, req);
    requireAdmin(session);
    await deleteCategory(prisma, parsedParams.data.id);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete category.");
  }
}
