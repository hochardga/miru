import { NextResponse } from "next/server";
import { bootstrapRun } from "@/lib/runs/bootstrap";
import { listRuns } from "@/lib/runs/queries";
import { getRouteUser } from "@/lib/supabase/server";
import { runsQuerySchema, startRunRequestSchema } from "@/lib/validation/schemas";

const INVALID_JSON = Symbol("invalid-json");

function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Start from the home screen to create or restore your Miru session.",
      },
    },
    { status: 401 },
  );
}

function badRequest(message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message,
      },
    },
    { status: 400 },
  );
}

async function readJsonBody(request: Request) {
  const rawBody = await request.text();

  if (rawBody.trim().length === 0) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return INVALID_JSON;
  }
}

export async function GET(request: Request) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = runsQuerySchema.safeParse({
    limit: searchParams.get("limit") ?? "5",
  });

  if (!parsedQuery.success) {
    return badRequest("Invalid runs query.");
  }

  const runs = await listRuns(supabase, user.id, parsedQuery.data.limit);

  return NextResponse.json({
    ok: true,
    data: { runs },
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return unauthorized();
  }

  const body = await readJsonBody(request);

  if (body === INVALID_JSON) {
    return badRequest("Request body must be valid JSON.");
  }

  const parsedBody = startRunRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return badRequest("Invalid run start payload.");
  }

  const data = await bootstrapRun({
    supabase,
    userId: user.id,
    input: body,
  });

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
