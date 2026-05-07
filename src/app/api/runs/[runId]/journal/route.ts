import { NextResponse } from "next/server";
import type { RunPrompt } from "@/lib/game/types";
import { getRouteUser } from "@/lib/supabase/server";
import { journalRequestSchema } from "@/lib/validation/schemas";

const INVALID_JSON = Symbol("invalid-json");

type RunRow = {
  id: string;
  current_day: number;
  current_tile_id: string | null;
  pending_prompt: RunPrompt | null;
};

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

function dayCompletePrompt(): RunPrompt {
  return {
    type: "day_complete",
    title: "Day recorded",
    body: "Your notes are saved. You can begin the next day.",
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
  const { data: run, error: runError } = await supabase
    .from("runs")
    .select("id,current_day,current_tile_id,pending_prompt")
    .eq("id", runId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (runError) {
    throw runError;
  }

  if (!run) {
    return notFound();
  }

  const runRow = run as RunRow;
  let tileId = parsed.data.tileId ?? runRow.current_tile_id;

  if (parsed.data.tileId) {
    const { data: tile, error: tileError } = await supabase
      .from("run_tiles")
      .select("id")
      .eq("id", parsed.data.tileId)
      .eq("run_id", runRow.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (tileError) {
      throw tileError;
    }

    if (!tile) {
      return tileNotFound();
    }

    tileId = parsed.data.tileId;
  }

  const timestamp = new Date().toISOString();
  const { data: journalEntry, error: journalError } = await supabase
    .from("journal_entries")
    .upsert(
      {
        run_id: runRow.id,
        user_id: user.id,
        day_number: parsed.data.dayNumber,
        tile_id: tileId,
        body: parsed.data.body,
        updated_at: timestamp,
      },
      { onConflict: "run_id,day_number" },
    )
    .select("id,run_id,day_number,tile_id,body,updated_at")
    .single();

  if (journalError) {
    throw journalError;
  }

  const { error: runUpdateError } = await supabase
    .from("runs")
    .update({
      last_journal_entry: parsed.data.body,
      pending_prompt: dayCompletePrompt(),
      updated_at: timestamp,
    })
    .eq("id", runRow.id)
    .eq("user_id", user.id);

  if (runUpdateError) {
    throw runUpdateError;
  }

  const row = journalEntry as JournalEntryRow;

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: row.id,
        runId: row.run_id,
        dayNumber: row.day_number,
        tileId: row.tile_id,
        body: row.body,
        updatedAt: row.updated_at,
      },
    },
    { status: 201 },
  );
}
