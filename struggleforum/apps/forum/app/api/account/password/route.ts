import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { requireSession } from "@/src/server/auth/session";
import { parseJson } from "@/src/server/http/validation";
import { toErrorResponse } from "@/src/server/http/errors";
import { updatePassword } from "@/src/features/auth/service";
import { ChangePasswordBodySchema } from "@/src/features/auth/validation";

export async function PATCH(req: NextRequest) {
  const body = await parseJson(req, ChangePasswordBodySchema);

  if (!body.ok) {
    return body.res;
  }

  try {
    const session = await requireSession(prisma, req);
    await updatePassword(prisma, session.user.id, body.data);
    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to update password.");
  }
}
