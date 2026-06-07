import { appDb } from "../lib/supabaseClient";
import { monthKey, weekKey } from "../game/economy";
import type { GameState, LeaderboardEntry, LeaderboardPeriod } from "../types/game";

export function periodKeyFor(period: LeaderboardPeriod): string {
  if (period === "weekly") return weekKey();
  if (period === "monthly") return monthKey();
  return "global";
}

export async function publishLeaderboardSnapshot(
  state: GameState,
  displayName: string,
  period: LeaderboardPeriod
): Promise<LeaderboardEntry> {
  const { data, error } = await appDb
    .rpc("publish_leaderboard_snapshot", {
      p_period: period,
      p_period_key: periodKeyFor(period),
      p_score: Math.round(state.netWorth),
      p_net_worth: Math.round(state.netWorth),
      p_level: state.level,
      p_highest_tier: state.highestTier,
      p_merged_count: state.merges,
      p_display_name: displayName,
    })
    .single();
  if (error) throw error;
  return data as LeaderboardEntry;
}

export async function fetchLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const { data, error } = await appDb
    .from("leaderboard_entries")
    .select("*")
    .eq("period", period)
    .eq("period_key", periodKeyFor(period))
    .order("score", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as LeaderboardEntry[];
}
