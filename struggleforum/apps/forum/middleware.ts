import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set(
  (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const ALLOW_NO_ORIGIN = true;

function getCorsOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (!origin) {
    return ALLOW_NO_ORIGIN ? "*" : null;
  }

  if (ALLOWED_ORIGINS.has(origin)) {
    return origin;
  }

  return null;
}

function setCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
}

export function middleware(req: NextRequest) {
  const corsOrigin = getCorsOrigin(req) ?? "*";

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
