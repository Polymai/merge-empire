export type BoardCell = number;

export type BoardItem = {
  id: string;
  tier: number;
  cell: BoardCell;
  createdAt: number;
  payoutReadyAt: number;
};

export type ItemShape = "bubble" | "circle" | "pill" | "drop" | "flower" | "gem" | "ticket";
export type EmojiIconKey = string;

export type ItemTier = {
  tier: number;
  name: string;
  symbol: string;
  iconKey: EmojiIconKey;
  icon: string;
  shape: ItemShape;
  tagline: string;
  palette: string;
  revenue: number;
  xp: number;
};

export type MissionKind = "daily" | "career";

export type Mission = {
  id: string;
  kind: MissionKind;
  title: string;
  metric: "merges" | "coins" | "tier" | "spawns" | "income" | "level";
  target: number;
  rewardCoins: number;
  rewardXp: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
};

export type ShopItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  kind: "booster" | "utility" | "cosmetic";
  durationMs?: number;
  spaceRequired?: number;
  disabled?: boolean;
};

export type GameBoosts = {
  incomeMultiplierUntil: number;
  spawnDiscountUntil: number;
  xpMultiplierUntil: number;
  autoClickerUntil: number;
};

export type PaidPowerupEffect = {
  coins?: number;
  xp?: number;
  xpBoostMs?: number;
  autoClickerMs?: number;
};

export type GameState = {
  version: number;
  boardSize: number;
  items: BoardItem[];
  coins: number;
  lifetimeCoins: number;
  xp: number;
  level: number;
  netWorth: number;
  highestTier: number;
  merges: number;
  spawns: number;
  incomeCollected: number;
  dailyStreak: number;
  lastDailyClaim: string;
  claimedMissionIds: string[];
  achievements: string[];
  redeemedPurchaseIds: string[];
  boosts: GameBoosts;
  activeTheme: "neon" | "mint" | "gold";
  updatedAt: string;
};

export type GameAction =
  | { type: "spawn"; now?: number }
  | { type: "move"; itemId: string; toCell: BoardCell }
  | { type: "merge"; sourceId: string; targetId: string; now?: number }
  | { type: "collectIncome"; now?: number }
  | { type: "autoTick"; now?: number }
  | { type: "claimDaily"; today?: string; now?: number }
  | { type: "claimMission"; missionId: string }
  | { type: "buyShopItem"; itemId: string; now?: number }
  | { type: "applyPaidPowerup"; purchaseId: string; effect: PaidPowerupEffect; now?: number }
  | { type: "setTheme"; theme: GameState["activeTheme"] }
  | { type: "load"; state: GameState };

export type SavePayload = {
  version: number;
  state: GameState;
};

export type LeaderboardPeriod = "global" | "weekly" | "monthly";

export type LeaderboardEntry = {
  id: string;
  user_id: string;
  display_name: string;
  period: LeaderboardPeriod;
  period_key: string;
  score: number;
  net_worth: number;
  level: number;
  highest_tier: number;
  merged_count: number;
  updated_at: string;
};
