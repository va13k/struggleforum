import type { NextRequest } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { toErrorResponse } from "@/src/server/http/errors";
import {
  requireAdmin,
  requireSession,
  type AuthenticatedSession,
} from "./session";

type RouteContext<
  Params extends Record<string, string> = Record<string, string>,
> = {
  params: Promise<Params> | Params;
};

type PublicHandler<Params extends Record<string, string>> = (
  req: NextRequest,
  ctx: RouteContext<Params>,
) => Promise<Response>;

type AuthedHandler<Params extends Record<string, string>> = (
  req: NextRequest,
  session: AuthenticatedSession,
  ctx: RouteContext<Params>,
) => Promise<Response>;

interface RouteHandlerOptions {
  fallbackMessage?: string;
}

/**
 * Marks a route handler as intentionally public - it does not change
 * behavior. It exists so the route-auth guardrail test
 * (src/test/route-auth-guardrail.test.ts) can tell "deliberately public"
 * apart from "someone forgot to add auth," which is otherwise
 * indistinguishable from a plain exported handler.
 */
export function withPublicRoute<
  Params extends Record<string, string> = Record<string, string>,
>(_reason: string, handler: PublicHandler<Params>) {
  return async (req: NextRequest, ctx?: RouteContext<Params>) => {
    return handler(req, ctx as RouteContext<Params>);
  };
}

/**
 * Wraps a route handler so it only runs for an authenticated session.
 * Centralizes the requireSession call and error handling that every
 * protected route previously repeated by hand.
 */
export function withAuth<
  Params extends Record<string, string> = Record<string, string>,
>(handler: AuthedHandler<Params>, options: RouteHandlerOptions = {}) {
  return async (req: NextRequest, ctx?: RouteContext<Params>) => {
    try {
      const session = await requireSession(prisma, req);
      return await handler(req, session, ctx as RouteContext<Params>);
    } catch (error) {
      return toErrorResponse(
        error,
        options.fallbackMessage ?? "Request failed.",
      );
    }
  };
}

/**
 * Wraps a route handler so it only runs for an authenticated admin.
 */
export function withAdmin<
  Params extends Record<string, string> = Record<string, string>,
>(handler: AuthedHandler<Params>, options: RouteHandlerOptions = {}) {
  return withAuth<Params>(async (req, session, ctx) => {
    requireAdmin(session);
    return handler(req, session, ctx);
  }, options);
}
