import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { listUsers, createUser } from "@/src/features/users/service";
import { parseJson } from "@/src/server/http/validation";
import { CreateUserBodySchema } from "@/src/server/validation/users";

export async function GET(req: NextRequest) {
  try {
    const users = await listUsers(prisma);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json("Failed to fetch users.", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await parseJson(req, CreateUserBodySchema);
  if (!body.ok) {
    return body.res;
  }
  try {
    const user = await createUser(prisma, body.data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create new user." },
      { status: 500 },
    );
  }
}
