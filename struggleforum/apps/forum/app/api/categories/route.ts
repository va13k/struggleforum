import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireAdmin, requireSession } from "@/src/server/auth/session";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { createCategory, listCategories } from "@/src/features/categories/service";
import { CreateCategoryBodySchema } from "@/src/features/categories/validation";

export async function GET() {
  try {
    const categories = await listCategories(prisma);
    return NextResponse.json({ categories });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch categories.");
  }
}

export async function POST(req: NextRequest) {
  const body = await parseJson(req, CreateCategoryBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    requireAdmin(session);
    const category = await createCategory(prisma, body.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create category.");
  }
}
