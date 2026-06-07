import type { GameState, Mission } from "../types/game";

export const MISSIONS: Mission[] = [
  { id: "daily-merge-6", kind: "daily", title: "Close 6 mergers", metric: "merges", target: 6, rewardCoins: 180, rewardXp: 40 },
  { id: "daily-spawn-8", kind: "daily", title: "Launch 8 ventures", metric: "spawns", target: 8, rewardCoins: 120, rewardXp: 35 },
  { id: "daily-income-500", kind: "daily", title: "Collect 500 revenue", metric: "income", target: 500, rewardCoins: 220, rewardXp: 55 },
  { id: "career-tier-10", kind: "career", title: "Unlock tier 10", metric: "tier", target: 10, rewardCoins: 900, rewardXp: 180 },
  { id: "career-tier-25", kind: "career", title: "Reach deeptech", metric: "tier", target: 25, rewardCoins: 4200, rewardXp: 720 },
  { id: "career-level-12", kind: "career", title: "Build a level 12 empire", metric: "level", target: 12, rewardCoins: 1800, rewardXp: 420 },
  { id: "career-coins-25000", kind: "career", title: "Bank 25K lifetime coins", metric: "coins", target: 25000, rewardCoins: 6000, rewardXp: 900 },
];

export function missionProgress(state: GameState, mission: Mission): number {
  switch (mission.metric) {
    case "merges":
      return state.merges;
    case "coins":
      return state.lifetimeCoins;
    case "tier":
      return state.highestTier;
    case "spawns":
      return state.spawns;
    case "income":
      return state.incomeCollected;
    case "level":
      return state.level;
    default:
      return 0;
  }
}

export function isMissionComplete(state: GameState, mission: Mission): boolean {
  return missionProgress(state, mission) >= mission.target;
}
