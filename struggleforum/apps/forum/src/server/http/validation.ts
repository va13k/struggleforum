import { z } from "zod";
import { NextResponse } from "next/server";

export async function parseJson<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
) {
  let data: unknown;

  try {
    data = await req.json();
  } catch (error) {
    return {
      ok: false as const,
      res: NextResponse.json(
        {
          error: "Invalid JSON",
        },
        { status: 400 },
      ),
    };
  }

  const parsedJson = schema.safeParse(data);
  if (!parsedJson.success) {
    return {
      ok: false as const,
      res: NextResponse.json(
        {
          error: "Validation error",
          issues: parsedJson.error,
        },
        { status: 400 },
      ),
    };
  }

  return {
    ok: true as const,
    data: parsedJson.data as z.infer<T>,
  };
}

export function parseParams<T extends z.ZodTypeAny>(
  params: unknown,
  schema: T,
) {
  const parsedParams = schema.safeParse(params);

  if (!parsedParams.success) {
    return {
      ok: false as const,
      res: NextResponse.json(
        { error: "Invalid route params", issues: parsedParams.error },
        { status: 400 },
      ),
    };
  }

  return {
    ok: true as const,
    data: parsedParams.data as z.infer<T>,
  };
}
