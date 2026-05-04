import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { startRunRequestSchema } from "@/lib/validation/schemas";

type RouteSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type BootstrapRunRow = {
  run_id: string;
  current_tile_id: string;
};

type BootstrapArgs = {
  supabase: RouteSupabaseClient;
  userId: string;
  input: unknown;
};

export async function bootstrapRun({ supabase, userId, input }: BootstrapArgs) {
  const payload = startRunRequestSchema.parse(input ?? {});

  const { data, error } = await supabase.rpc("bootstrap_run", {
    p_user_id: userId,
    p_title: payload.title ?? null,
    p_starting_column: payload.startingColumn,
  });

  if (error) {
    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as BootstrapRunRow | null;

  if (!row?.run_id || !row.current_tile_id) {
    throw new Error("bootstrap_run returned an incomplete result.");
  }

  return {
    runId: row.run_id,
    currentTileId: row.current_tile_id,
  };
}
