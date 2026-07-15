import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAdmin } from "@/src/server/auth/route-handlers";
import {
  parseJson,
  parseParams,
  resolveRouteParams,
} from "@/src/server/http/validation";
import { updateUserRole } from "@/src/features/admin/service";
import {
  AdminUpdateUserRoleBodySchema,
  UserIdParamSchema,
} from "@/src/server/validation/users";

export const PATCH = withAdmin<{ id: string }>(
  async (req, _session, { params }) => {
    const routeParams = await resolveRouteParams(params);
    const parsedParams = parseParams(routeParams, UserIdParamSchema);

    if (!parsedParams.ok) {
      return parsedParams.res;
    }

    const body = await parseJson(req, AdminUpdateUserRoleBodySchema);

    if (!body.ok) {
      return body.res;
    }

    const user = await updateUserRole(prisma, parsedParams.data.id, body.data);
    return NextResponse.json(user);
  },
  { fallbackMessage: "Failed to update user role." },
);
