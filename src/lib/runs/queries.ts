import type { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function listRuns(
  supabase: RouteSupabaseClient,
  userId: string,
  limit = 5,
) {
  const { data, error } = await supabase
    .from("runs")
    .select("id,title,status,current_day,updated_at,last_journal_entry")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getRunShell(
  supabase: RouteSupabaseClient,
  userId: string,
  runId: string,
) {
  const { data: run, error: runError } = await supabase
    .from("runs")
    .select("id,title,status,current_day,hp,ep,current_tile_id,pending_prompt")
    .eq("id", runId)
    .eq("user_id", userId)
    .maybeSingle();

  if (runError) {
    throw runError;
  }

  if (!run) {
    return null;
  }

  if (!run.current_tile_id) {
    return null;
  }

  const { data: tile, error: tileError } = await supabase
    .from("run_tiles")
    .select("id,row_number,column_letter,terrain,visited")
    .eq("id", run.current_tile_id)
    .eq("run_id", run.id)
    .maybeSingle();

  if (tileError) {
    throw tileError;
  }

  if (!tile) {
    return null;
  }

  const { data: mealBar, error: mealBarError } = await supabase
    .from("run_inventory")
    .select("quantity")
    .eq("run_id", run.id)
    .eq("item_key", "meal-bar")
    .maybeSingle();

  if (mealBarError) {
    throw mealBarError;
  }

  return {
    ...run,
    tile,
    mealBars: mealBar?.quantity ?? 0,
  };
}
