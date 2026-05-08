import { NextResponse } from "next/server";
import { getRunSnapshot } from "@/lib/runs/snapshot";
import { getRouteUser } from "@/lib/supabase/server";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return unauthorized();
  }

  const { runId } = await params;
  const snapshot = await getRunSnapshot(supabase, user.id, runId);

  if (!snapshot) {
    return notFound();
  }

  return NextResponse.json({ ok: true, data: snapshot });
}
