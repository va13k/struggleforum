import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { login } from "@/src/features/auth/service";
import { LoginBodySchema } from "@/src/features/auth/validation";

export async function POST(req: NextRequest) {
  const body = await parseJson(req, LoginBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const result = await login(prisma, body.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, "Failed to login.");
  }
}
