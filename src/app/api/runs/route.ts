import { NextResponse } from "next/server";
import { bootstrapRun } from "@/lib/runs/bootstrap";
import { listRuns } from "@/lib/runs/queries";
import { getRouteUser } from "@/lib/supabase/server";
import { runsQuerySchema } from "@/lib/validation/schemas";

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

export async function GET(request: Request) {
  const { supabase, user } = await getRouteUser();

  if (!user) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const { limit } = runsQuerySchema.parse({
    limit: searchParams.get("limit") ?? "5",
  });

  const runs = await listRuns(supabase, user.id, limit);

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

  const body = await request.json().catch(() => ({}));
  const data = await bootstrapRun({
    supabase,
    userId: user.id,
    input: body,
  });

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
