import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { withAuth } from "@/src/server/auth/route-handlers";
import { parseJson } from "@/src/server/http/validation";
import { updatePassword } from "@/src/features/auth/service";
import { ChangePasswordBodySchema } from "@/src/features/auth/validation";

export const PATCH = withAuth(
  async (req: NextRequest, session) => {
    const body = await parseJson(req, ChangePasswordBodySchema);

    if (!body.ok) {
      return body.res;
    }

    await updatePassword(prisma, session.user.id, body.data);
    return NextResponse.json({ message: "Password updated successfully" });
  },
  { fallbackMessage: "Failed to update password." },
);
