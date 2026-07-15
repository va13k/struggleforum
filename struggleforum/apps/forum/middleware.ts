import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set(
  (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

/**
 * Sessions are now an httpOnly cookie, so every cross-origin request that
 * needs auth is a *credentialed* request. Credentialed requests can never
 * use a wildcard `Access-Control-Allow-Origin: *` - browsers reject that
 * combination outright - so allowed origins must be echoed back explicitly,
 * and requests from an origin that isn't on the allowlist get no CORS
 * headers at all (the browser blocks them client-side).
 *
 * Requests with no Origin header (same-origin navigation, server-to-server
 * calls, curl) aren't subject to CORS in the first place, so nothing needs
 * to be set for them.
 */
function getCorsOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (!origin) {
    return null;
  }

  if (ALLOWED_ORIGINS.has(origin)) {
    return origin;
  }

  return null;
}

function setCorsHeaders(res: NextResponse, origin: string | null) {
  if (!origin) {
    return;
  }

  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
}

export function middleware(req: NextRequest) {
  const corsOrigin = getCorsOrigin(req);

  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    setCorsHeaders(res, corsOrigin);
    return res;
  }

  const res = NextResponse.next();
  setCorsHeaders(res, corsOrigin);

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
