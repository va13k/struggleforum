import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withPublicRoute } from "@/src/server/auth/route-handlers";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/src/server/auth/session";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { login } from "@/src/features/auth/service";
import { LoginBodySchema } from "@/src/features/auth/validation";

export const POST = withPublicRoute(
  "Login must be reachable without a session - it's how a session is created.",
  async (req: NextRequest) => {
    const body = await parseJson(req, LoginBodySchema);

    if (!body.ok) {
      return body.res;
    }

    try {
      const result = await login(prisma, body.data);
      const res = NextResponse.json({ user: result.user });
      res.cookies.set(
        SESSION_COOKIE_NAME,
        result.token,
        sessionCookieOptions(),
      );
      return res;
    } catch (error) {
      return toErrorResponse(error, "Failed to login.");
    }
  },
);
