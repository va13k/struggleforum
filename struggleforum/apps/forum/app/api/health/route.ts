import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";

export async function GET() {
    const result = await prisma.user.count();
    return NextResponse.json({ status: "ok", userCount: result });
}