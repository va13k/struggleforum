import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import {
  UpdateUserBodySchema,
  UserIdParamSchema,
} from "@/src/server/validation/users";
import { parseJson, parseParams } from "@/src/server/http/validation";
import { listUser, updateUser, deleteUser } from "@/src/features/users/service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const p = parseParams(params, UserIdParamSchema);
  if (!p.ok) {
    return p.res;
  }

  try {
    const user = await listUser(prisma, params.id);
    return NextResponse.json(user);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user.";
    const status = message === "User not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const p = parseParams(params, UserIdParamSchema);
  if (!p.ok) {
    return p.res;
  }

  const body = await parseJson(req, UpdateUserBodySchema);
  if (!body.ok) {
    return body.res;
  }

  try {
    const user = updateUser(prisma, p.data.id, body.data);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const p = parseParams(params, UserIdParamSchema);
  if (!p.ok) {
    return p.res;
  }

  try {
    await deleteUser(prisma, p.data.id);
    return NextResponse.json(
      { message: `User with id: ${params.id} deleted` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 },
    );
  }
}
