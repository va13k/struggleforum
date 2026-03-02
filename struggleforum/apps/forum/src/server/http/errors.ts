import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Authentication required") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Resource already exists") {
    super(409, message);
  }
}

export function toErrorResponse(
  error: unknown,
  fallbackMessage = "Internal server error",
) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Related resource does not exist" },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (error.code === "P2021" || error.code === "P2022") {
      return NextResponse.json(
        { error: "Database schema is out of date" },
        { status: 500 },
      );
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { error: "Database is unavailable" },
      { status: 503 },
    );
  }

  console.error(error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
