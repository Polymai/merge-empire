import { appDb } from "../lib/supabaseClient";
import type { GameState, SavePayload } from "../types/game";
import { serializeSave } from "../storage/localSave";

export type CloudSaveRow = {
  id: string;
  user_id: string;
  save_slot: string;
  progress: SavePayload;
  coins: number;
  xp: number;
  level: number;
  highest_tier: number;
  board_size: number;
  net_worth: number;
  merged_count: number;
  updated_at: string;
};

export async function loadCloudSave(userId: string): Promise<GameState | null> {
  const { data, error } = await appDb
    .from("player_saves")
    .select("*")
    .eq("user_id", userId)
    .eq("save_slot", "main")
    .maybeSingle();
  if (error) throw error;
  const row = data as CloudSaveRow | null;
  return row?.progress?.state ?? null;
}

export async function saveCloudState(userId: string, state: GameState): Promise<CloudSaveRow> {
  const payload = serializeSave(state);
  const { data, error } = await appDb
    .from("player_saves")
    .upsert(
      {
        user_id: userId,
        save_slot: "main",
        progress: payload,
        coins: state.coins,
        xp: state.xp,
        level: state.level,
        highest_tier: state.highestTier,
        board_size: state.boardSize,
        net_worth: state.netWorth,
        merged_count: state.merges,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,save_slot" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as CloudSaveRow;
}
