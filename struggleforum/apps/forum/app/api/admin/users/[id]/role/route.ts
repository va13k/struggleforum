import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireAdmin, requireSession } from "@/src/server/auth/session";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { updateUserRole } from "@/src/features/admin/service";
import {
  AdminUpdateUserRoleBodySchema,
  UserIdParamSchema,
} from "@/src/server/validation/users";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const routeParams = await resolveRouteParams(params);
  const parsedParams = parseParams(routeParams, UserIdParamSchema);

  if (!parsedParams.ok) {
    return parsedParams.res;
  }

  const body = await parseJson(req, AdminUpdateUserRoleBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    requireAdmin(session);
    const user = await updateUserRole(prisma, parsedParams.data.id, body.data);
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error, "Failed to update user role.");
  }
}
