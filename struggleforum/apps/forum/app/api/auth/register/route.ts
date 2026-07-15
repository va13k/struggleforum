import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withPublicRoute } from "@/src/server/auth/route-handlers";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/src/server/auth/session";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { register } from "@/src/features/auth/service";
import { RegisterBodySchema } from "@/src/features/auth/validation";

export const POST = withPublicRoute(
  "Registration must be reachable without a session - it's how an account is created.",
  async (req: NextRequest) => {
    const body = await parseJson(req, RegisterBodySchema);

    if (!body.ok) {
      return body.res;
    }

    try {
      const result = await register(prisma, body.data);
      const res = NextResponse.json({ user: result.user }, { status: 201 });
      res.cookies.set(
        SESSION_COOKIE_NAME,
        result.token,
        sessionCookieOptions(),
      );
      return res;
    } catch (error) {
      return toErrorResponse(error, "Failed to register user.");
    }
  },
);
