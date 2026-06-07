import type { BoardItem, GameState } from "../types/game";
import { SAVE_VERSION } from "../config/runtime";
import { calculateNetWorth } from "./economy";

function starterItem(id: string, tier: number, cell: number, now: number): BoardItem {
  return {
    id,
    tier,
    cell,
    createdAt: now,
    payoutReadyAt: now + 12000,
  };
}

export function createInitialGameState(now = Date.now()): GameState {
  const items = [
    starterItem("seed-1", 1, 6, now),
    starterItem("seed-2", 1, 7, now),
    starterItem("seed-3", 2, 12, now),
    starterItem("seed-4", 2, 13, now),
  ];

  return {
    version: SAVE_VERSION,
    boardSize: 5,
    items,
    coins: 240,
    lifetimeCoins: 240,
    xp: 0,
    level: 1,
    netWorth: calculateNetWorth(items, 240),
    highestTier: 2,
    merges: 0,
    spawns: 4,
    incomeCollected: 0,
    dailyStreak: 0,
    lastDailyClaim: "",
    claimedMissionIds: [],
    achievements: [],
    boosts: {
      incomeMultiplierUntil: 0,
      spawnDiscountUntil: 0,
    },
    activeTheme: "neon",
    updatedAt: new Date(now).toISOString(),
  };
}
