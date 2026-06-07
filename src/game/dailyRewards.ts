export const DAILY_REWARDS = [
  { day: 1, coins: 120, xp: 20, label: "Opening float" },
  { day: 2, coins: 180, xp: 35, label: "Hot lead" },
  { day: 3, coins: 260, xp: 50, label: "Smart inventory" },
  { day: 4, coins: 380, xp: 70, label: "Growth memo" },
  { day: 5, coins: 540, xp: 95, label: "Market signal" },
  { day: 6, coins: 760, xp: 130, label: "Venture reserve" },
  { day: 7, coins: 1200, xp: 220, label: "Empire dividend" },
];

export function dailyRewardForStreak(streak: number) {
  return DAILY_REWARDS[Math.max(0, Math.min(DAILY_REWARDS.length - 1, streak % DAILY_REWARDS.length))];
}
