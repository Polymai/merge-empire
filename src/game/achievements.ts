import type { Achievement, GameState } from "../types/game";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-merger", title: "First Merger", description: "Complete your first same-tier merge.", rewardCoins: 80 },
  { id: "ten-mergers", title: "Deal Desk", description: "Complete 10 mergers.", rewardCoins: 260 },
  { id: "tier-8", title: "City Builder", description: "Unlock tier 8.", rewardCoins: 500 },
  { id: "tier-18", title: "Scale Operator", description: "Unlock tier 18.", rewardCoins: 1600 },
  { id: "tier-32", title: "Category King", description: "Unlock tier 32.", rewardCoins: 5200 },
  { id: "level-20", title: "Boardroom Legend", description: "Reach level 20.", rewardCoins: 9000 },
  { id: "million-worth", title: "Seven Figures", description: "Reach 1M net worth.", rewardCoins: 12000 },
];

export function unlockedAchievements(state: GameState): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => {
    if (state.achievements.includes(achievement.id)) return false;
    if (achievement.id === "first-merger") return state.merges >= 1;
    if (achievement.id === "ten-mergers") return state.merges >= 10;
    if (achievement.id === "tier-8") return state.highestTier >= 8;
    if (achievement.id === "tier-18") return state.highestTier >= 18;
    if (achievement.id === "tier-32") return state.highestTier >= 32;
    if (achievement.id === "level-20") return state.level >= 20;
    if (achievement.id === "million-worth") return state.netWorth >= 1_000_000;
    return false;
  });
}
