import { NextResponse } from "next/server";
import { withAuth } from "@/src/server/auth/route-handlers";

export const GET = withAuth(
  async (_req, session) => {
    return NextResponse.json(session.user);
  },
  { fallbackMessage: "Failed to fetch current user." },
);
