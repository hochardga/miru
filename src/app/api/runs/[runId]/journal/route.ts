import { NextResponse } from "next/server";
import { UUID_PATTERN } from "@/lib/runs/queries";
import { getRouteUser } from "@/lib/supabase/server";
import { journalRequestSchema } from "@/lib/validation/schemas";

const INVALID_JSON = Symbol("invalid-json");

type JournalEntryRow = {
  id: string;
  run_id: string;
  day_number: number;
  tile_id: string | null;
  body: string;
  updated_at: string;
};

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

function invalidJournalEntry() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INVALID_JOURNAL_ENTRY",
        message: "Invalid journal entry payload.",
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

function tileNotFound() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "RUN_TILE_NOT_FOUND",
        message: "That tile could not be found for this run.",
      },
    },
    { status: 404 },
  );
}

function invalidJournalState() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INVALID_JOURNAL_STATE",
        message: "That journal prompt is no longer active for this run.",
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

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

function mapJournalError(error: unknown) {
  const message = errorMessage(error);

  if (message.includes("RUN_NOT_FOUND")) {
    return notFound();
  }

  if (message.includes("RUN_TILE_NOT_FOUND")) {
    return tileNotFound();
  }

  if (message.includes("INVALID_JOURNAL_STATE")) {
    return invalidJournalState();
  }

  return null;
}

function mapJournalEntry(row: JournalEntryRow) {
  return {
    id: row.id,
    runId: row.run_id,
    dayNumber: row.day_number,
    tileId: row.tile_id,
    body: row.body,
    updatedAt: row.updated_at,
  };
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
    return invalidJournalEntry();
  }

  const parsed = journalRequestSchema.safeParse(body);

  if (!parsed.success) {
    return invalidJournalEntry();
  }

  const { runId } = await params;

  if (!UUID_PATTERN.test(runId)) {
    return notFound();
  }

  const { data, error } = await supabase.rpc("persist_journal_entry", {
    p_user_id: user.id,
    p_run_id: runId,
    p_day_number: parsed.data.dayNumber,
    p_tile_id: parsed.data.tileId ?? null,
    p_body: parsed.data.body,
  });

  if (error) {
    const mappedError = mapJournalError(error);

    if (mappedError) {
      return mappedError;
    }

    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as JournalEntryRow | null;

  if (!row?.id || !row.updated_at) {
    throw new Error("persist_journal_entry returned an incomplete row.");
  }

  return NextResponse.json(
    {
      ok: true,
      data: mapJournalEntry(row),
    },
    { status: 201 },
  );
}
