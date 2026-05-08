import { NextResponse } from "next/server";
import type { RunSnapshot } from "@/lib/game/types";
import { applyRunAction } from "@/lib/runs/actions";
import { getRouteUser } from "@/lib/supabase/server";
import { gameActionRequestSchema } from "@/lib/validation/schemas";

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

function badRequest() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid run action payload.",
      },
    },
    { status: 400 },
  );
}

function notFound() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "RUN_NOT_FOUND",
        message: "That run could not be found for this session.",
      },
    },
    { status: 404 },
  );
}

function staleAction(validActions: RunSnapshot["legalActions"]) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INVALID_ACTION_FOR_STATE",
        message: "That action is no longer valid for this run state.",
        details: { validActions },
      },
    },
    { status: 409 },
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

function isInvalidActionForStateError(
  error: unknown,
): error is Error & { validActions: RunSnapshot["legalActions"] } {
  return (
    error instanceof Error &&
    error.message === "INVALID_ACTION_FOR_STATE" &&
    Array.isArray((error as { validActions?: unknown }).validActions)
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return unauthorized();
  }

  const body = await readJsonBody(request);

  if (body === INVALID_JSON) {
    return badRequest();
  }

  const parsed = gameActionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest();
  }

  try {
    const { runId } = await params;
    const result = await applyRunAction({
      supabase,
      userId: user.id,
      runId,
      action: parsed.data,
    });

    if (!result) {
      return notFound();
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    if (isInvalidActionForStateError(error)) {
      return staleAction(error.validActions);
    }

    throw error;
  }
}
