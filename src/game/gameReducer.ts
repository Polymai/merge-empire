import type { BoardCell, BoardItem, GameAction, GameState } from "../types/game";
import { ACHIEVEMENTS, unlockedAchievements } from "./achievements";
import { dailyRewardForStreak } from "./dailyRewards";
import {
  boardCapacity,
  boardSizeForLevel,
  calculateNetWorth,
  incomeForItems,
  levelFromXp,
  mergeRewardForTier,
  spawnCost,
  todayKey,
} from "./economy";
import { MAX_TIER } from "./itemTiers";
import { isMissionComplete, MISSIONS } from "./missions";
import { getShopItem } from "./shopCatalog";

const XP_POWERUP_MULTIPLIER = 3;

function stamp(state: GameState, now: number): GameState {
  const level = levelFromXp(state.xp);
  const boardSize = Math.max(state.boardSize, boardSizeForLevel(level));
  return {
    ...state,
    redeemedPurchaseIds: state.redeemedPurchaseIds ?? [],
    boosts: {
      incomeMultiplierUntil: state.boosts?.incomeMultiplierUntil ?? 0,
      spawnDiscountUntil: state.boosts?.spawnDiscountUntil ?? 0,
      xpMultiplierUntil: state.boosts?.xpMultiplierUntil ?? 0,
      autoClickerUntil: state.boosts?.autoClickerUntil ?? 0,
    },
    level,
    boardSize,
    netWorth: calculateNetWorth(state.items, state.coins),
    updatedAt: new Date(now).toISOString(),
  };
}

function cloneWithItems(state: GameState, items: BoardItem[], now: number): GameState {
  return stamp({ ...state, items }, now);
}

export function emptyCells(state: GameState): BoardCell[] {
  const occupied = new Set(state.items.map((item) => item.cell));
  return Array.from({ length: boardCapacity(state.boardSize) }, (_, index) => index).filter((cell) => !occupied.has(cell));
}

export function itemAtCell(state: GameState, cell: BoardCell): BoardItem | undefined {
  return state.items.find((item) => item.cell === cell);
}

export function canMerge(source: BoardItem | undefined, target: BoardItem | undefined): boolean {
  return Boolean(source && target && source.id !== target.id && source.tier === target.tier && target.tier < MAX_TIER);
}

function starterTierForSpawn(state: GameState, now: number): number {
  const roll = ((state.spawns * 1103515245 + state.merges * 12345 + now) % 1000) / 1000;
  if (state.highestTier < 5) return 1;
  if (state.highestTier < 12) return roll > 0.72 ? 2 : 1;
  if (state.highestTier < 24) return roll > 0.82 ? 3 : roll > 0.5 ? 2 : 1;
  return roll > 0.9 ? 4 : roll > 0.62 ? 3 : 2;
}

function createBoardItem(now: number, sequence: number, tier: number, cell: BoardCell): BoardItem {
  return {
    id: `item-${now}-${sequence}`,
    tier,
    cell,
    createdAt: now,
    payoutReadyAt: now + 14000,
  };
}

function extendTimedBoost(currentUntil: number, now: number, durationMs = 0): number {
  if (durationMs <= 0) return currentUntil;
  return Math.max(currentUntil, now) + durationMs;
}

function applyAchievementRewards(state: GameState): GameState {
  const newlyUnlocked = unlockedAchievements(state);
  if (!newlyUnlocked.length) return state;
  return {
    ...state,
    achievements: [...state.achievements, ...newlyUnlocked.map((achievement) => achievement.id)],
    coins: state.coins + newlyUnlocked.reduce((sum, achievement) => sum + achievement.rewardCoins, 0),
    lifetimeCoins: state.lifetimeCoins + newlyUnlocked.reduce((sum, achievement) => sum + achievement.rewardCoins, 0),
  };
}

export function reduceGame(state: GameState, action: GameAction): GameState {
  const now = "now" in action && typeof action.now === "number" ? action.now : Date.now();

  if (action.type === "load") return stamp(action.state, now);

  if (action.type === "spawn") {
    const cells = emptyCells(state);
    const cost = spawnCost(state);
    if (!cells.length || state.coins < cost) return state;
    const item = createBoardItem(now, state.spawns + 1, starterTierForSpawn(state, now), cells[0]);
    return stamp(
      {
        ...state,
        coins: state.coins - cost,
        spawns: state.spawns + 1,
        items: [...state.items, item],
      },
      now
    );
  }

  if (action.type === "move") {
    if (itemAtCell(state, action.toCell)) return state;
    return cloneWithItems(
      state,
      state.items.map((item) => (item.id === action.itemId ? { ...item, cell: action.toCell } : item)),
      now
    );
  }

  if (action.type === "merge") {
    const source = state.items.find((item) => item.id === action.sourceId);
    const target = state.items.find((item) => item.id === action.targetId);
    if (!canMerge(source, target) || !source || !target) return state;
    const reward = mergeRewardForTier(source.tier);
    const xpMultiplier = now < (state.boosts.xpMultiplierUntil ?? 0) ? XP_POWERUP_MULTIPLIER : 1;
    const upgraded: BoardItem = {
      ...target,
      tier: target.tier + 1,
      payoutReadyAt: now + Math.max(7000, 15000 - target.tier * 120),
    };
    const items = state.items.filter((item) => item.id !== source.id && item.id !== target.id).concat(upgraded);
    return stamp(
      applyAchievementRewards({
        ...state,
        items,
        coins: state.coins + reward.coins,
        lifetimeCoins: state.lifetimeCoins + reward.coins,
        xp: state.xp + reward.xp * xpMultiplier,
        highestTier: Math.max(state.highestTier, upgraded.tier),
        merges: state.merges + 1,
      }),
      now
    );
  }

  if (action.type === "autoTick") {
    if (now >= (state.boosts.autoClickerUntil ?? 0)) return state;
    let next = state;
    const multiplier = now < next.boosts.incomeMultiplierUntil ? 2 : 1;
    const income = incomeForItems(next.items, now, multiplier);
    if (income > 0) {
      next = {
        ...next,
        coins: next.coins + income,
        lifetimeCoins: next.lifetimeCoins + income,
        incomeCollected: next.incomeCollected + income,
        items: next.items.map((item) =>
          item.payoutReadyAt <= now ? { ...item, payoutReadyAt: now + Math.max(8000, 22000 - item.tier * 180) } : item
        ),
      };
    }
    const cells = emptyCells(next);
    const cost = spawnCost(next);
    if (cells.length && next.coins >= cost) {
      next = {
        ...next,
        coins: next.coins - cost,
        spawns: next.spawns + 1,
        items: [...next.items, createBoardItem(now, next.spawns + 1, starterTierForSpawn(next, now), cells[0])],
      };
    }
    return next === state ? state : stamp(next, now);
  }

  if (action.type === "collectIncome") {
    const multiplier = now < state.boosts.incomeMultiplierUntil ? 2 : 1;
    const income = incomeForItems(state.items, now, multiplier);
    if (income <= 0) return state;
    return stamp(
      {
        ...state,
        coins: state.coins + income,
        lifetimeCoins: state.lifetimeCoins + income,
        incomeCollected: state.incomeCollected + income,
        items: state.items.map((item) =>
          item.payoutReadyAt <= now ? { ...item, payoutReadyAt: now + Math.max(8000, 22000 - item.tier * 180) } : item
        ),
      },
      now
    );
  }

  if (action.type === "claimDaily") {
    const today = action.today ?? todayKey();
    if (state.lastDailyClaim === today) return state;
    const reward = dailyRewardForStreak(state.dailyStreak);
    return stamp(
      {
        ...state,
        dailyStreak: state.dailyStreak + 1,
        lastDailyClaim: today,
        coins: state.coins + reward.coins,
        lifetimeCoins: state.lifetimeCoins + reward.coins,
        xp: state.xp + reward.xp,
      },
      now
    );
  }

  if (action.type === "claimMission") {
    const mission = MISSIONS.find((entry) => entry.id === action.missionId);
    if (!mission || state.claimedMissionIds.includes(mission.id) || !isMissionComplete(state, mission)) return state;
    return stamp(
      {
        ...state,
        claimedMissionIds: [...state.claimedMissionIds, mission.id],
        coins: state.coins + mission.rewardCoins,
        lifetimeCoins: state.lifetimeCoins + mission.rewardCoins,
        xp: state.xp + mission.rewardXp,
      },
      now
    );
  }

  if (action.type === "buyShopItem") {
    const item = getShopItem(action.itemId);
    if (!item || item.disabled || state.coins < item.price) return state;
    if (item.id === "tiny-icon-pack" || item.id === "happy-icon-crate") {
      const count = item.id === "tiny-icon-pack" ? 2 : 1;
      const tier = item.id === "tiny-icon-pack" ? 1 : 2;
      const cells = emptyCells(state).slice(0, count);
      if (cells.length < count) return state;
      const purchasedItems = cells.map((cell, index) => createBoardItem(now, state.spawns + index + 1, tier, cell));
      return stamp(
        {
          ...state,
          coins: state.coins - item.price,
          spawns: state.spawns + purchasedItems.length,
          items: [...state.items, ...purchasedItems],
        },
        now
      );
    }
    if (item.id === "mint-theme") {
      if (state.activeTheme === "mint") return state;
      return stamp({ ...state, coins: state.coins - item.price, activeTheme: "mint" }, now);
    }
    if (item.id === "gold-theme") {
      if (state.activeTheme === "gold") return state;
      return stamp({ ...state, coins: state.coins - item.price, activeTheme: "gold" }, now);
    }
    if (item.id === "income-sprint") {
      return stamp(
        { ...state, coins: state.coins - item.price, boosts: { ...state.boosts, incomeMultiplierUntil: now + (item.durationMs ?? 0) } },
        now
      );
    }
    if (item.id === "launch-discount") {
      return stamp(
        { ...state, coins: state.coins - item.price, boosts: { ...state.boosts, spawnDiscountUntil: now + (item.durationMs ?? 0) } },
        now
      );
    }
  }

  if (action.type === "applyPaidPowerup") {
    if (state.redeemedPurchaseIds?.includes(action.purchaseId)) return state;
    const effect = action.effect;
    return stamp(
      applyAchievementRewards({
        ...state,
        coins: state.coins + Math.max(0, effect.coins ?? 0),
        lifetimeCoins: state.lifetimeCoins + Math.max(0, effect.coins ?? 0),
        xp: state.xp + Math.max(0, effect.xp ?? 0),
        redeemedPurchaseIds: [...(state.redeemedPurchaseIds ?? []), action.purchaseId],
        boosts: {
          ...state.boosts,
          xpMultiplierUntil: extendTimedBoost(state.boosts.xpMultiplierUntil ?? 0, now, effect.xpBoostMs),
          autoClickerUntil: extendTimedBoost(state.boosts.autoClickerUntil ?? 0, now, effect.autoClickerMs),
        },
      }),
      now
    );
  }

  if (action.type === "setTheme") return stamp({ ...state, activeTheme: action.theme }, now);

  return state;
}

export function achievementSummary(state: GameState) {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: state.achievements.includes(achievement.id),
  }));
}
