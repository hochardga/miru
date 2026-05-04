import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { startRunRequestSchema } from "@/lib/validation/schemas";

type RouteSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type BootstrapArgs = {
  supabase: RouteSupabaseClient;
  userId: string;
  input: unknown;
};

export async function bootstrapRun({ supabase, userId, input }: BootstrapArgs) {
  const payload = startRunRequestSchema.parse(input ?? {});

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    is_anonymous: true,
  });

  if (profileError) {
    throw profileError;
  }

  const { data: existingRun, error: existingRunError } = await supabase
    .from("runs")
    .select("id,current_tile_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingRunError) {
    throw existingRunError;
  }

  if (existingRun?.id && existingRun.current_tile_id) {
    return {
      runId: existingRun.id,
      currentTileId: existingRun.current_tile_id,
    };
  }

  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert({
      user_id: userId,
      title: payload.title ?? "Miru Run",
    })
    .select("id,current_day")
    .single();

  if (runError) {
    throw runError;
  }

  const { data: tile, error: tileError } = await supabase
    .from("run_tiles")
    .insert({
      run_id: run.id,
      user_id: userId,
      row_number: 1,
      column_letter: payload.startingColumn,
      terrain: "unknown",
      visited: true,
    })
    .select("id")
    .single();

  if (tileError) {
    throw tileError;
  }

  const { error: runUpdateError } = await supabase
    .from("runs")
    .update({ current_tile_id: tile.id })
    .eq("id", run.id);

  if (runUpdateError) {
    throw runUpdateError;
  }

  const { error: inventoryError } = await supabase.from("run_inventory").insert({
    run_id: run.id,
    user_id: userId,
    item_key: "meal-bar",
    item_name: "Meal Bar",
    category: "food",
    quantity: 3,
  });

  if (inventoryError) {
    throw inventoryError;
  }

  const { error: actionLogError } = await supabase.from("action_log").insert({
    run_id: run.id,
    user_id: userId,
    action_type: "start_run",
    day_number: 1,
    tile_id: tile.id,
    input: payload,
    result: {
      message: "Phase 0 placeholder run created.",
    },
  });

  if (actionLogError) {
    throw actionLogError;
  }

  return {
    runId: run.id,
    currentTileId: tile.id,
  };
}
