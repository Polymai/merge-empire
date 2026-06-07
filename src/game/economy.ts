import type { BoardItem, GameState } from "../types/game";
import { getTier } from "./itemTiers";

export function xpNeededForLevel(level: number): number {
  return Math.round(90 + Math.pow(level, 1.9) * 34);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpNeededForLevel(level) && level < 120) {
    remaining -= xpNeededForLevel(level);
    level += 1;
  }
  return level;
}

export function mergeRewardForTier(tier: number) {
  const target = getTier(Math.min(tier + 1, 60));
  return {
    coins: Math.round(target.revenue * 1.15 + tier * tier * 6),
    xp: target.xp,
  };
}

export function spawnCost(state: GameState): number {
  const discount = Date.now() < state.boosts.spawnDiscountUntil ? 0.75 : 1;
  const tierPressure = Math.max(0, state.highestTier - 2) * 4.6;
  const buyPressure = Math.max(0, state.spawns - 4) * 0.82;
  return Math.max(10, Math.round((10 + tierPressure + buyPressure) * discount));
}

export function boardCapacity(boardSize: number): number {
  return boardSize * boardSize;
}

export function boardSizeForLevel(level: number): number {
  if (level >= 28) return 8;
  if (level >= 16) return 7;
  if (level >= 8) return 6;
  return 5;
}

export function itemNetWorth(item: BoardItem): number {
  const tier = getTier(item.tier);
  return Math.round(tier.revenue * Math.pow(item.tier, 1.2));
}

export function calculateNetWorth(items: BoardItem[], coins: number): number {
  return items.reduce((sum, item) => sum + itemNetWorth(item), coins);
}

export function incomeForItems(items: BoardItem[], now: number, multiplier = 1): number {
  return items.reduce((total, item) => {
    if (item.payoutReadyAt > now) return total;
    return total + Math.round(getTier(item.tier).revenue * multiplier);
  }, 0);
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}K`;
  return Math.round(value).toLocaleString();
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function weekKey(date = new Date()): string {
  const first = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const day = Math.floor((date.getTime() - first.getTime()) / 86400000);
  const week = Math.ceil((day + first.getUTCDay() + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
