import type { PaidPowerupEffect } from "../types/game";

export type PaidPowerup = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  kind: "leveling" | "automation" | "bundle";
  effect: PaidPowerupEffect;
};

export const PAID_POWERUPS: PaidPowerup[] = [
  {
    id: "level-cloud-boost",
    title: "Level Cloud Boost",
    description: "Adds instant XP and keeps merge XP tripled for 30 minutes.",
    priceLabel: "EUR 1.99 (inkl. moms)",
    kind: "leveling",
    effect: {
      xp: 900,
      coins: 600,
      xpBoostMs: 30 * 60 * 1000,
    },
  },
  {
    id: "auto-helper",
    title: "Auto Helper",
    description: "Collects ready income and buys icons when space and coins allow for 30 minutes.",
    priceLabel: "EUR 2.99 (inkl. moms)",
    kind: "automation",
    effect: {
      autoClickerMs: 30 * 60 * 1000,
      coins: 900,
    },
  },
  {
    id: "founder-bundle",
    title: "Founder Bundle",
    description: "Combines the XP boost and auto helper for one hour, plus a larger coin drop.",
    priceLabel: "EUR 4.99 (inkl. moms)",
    kind: "bundle",
    effect: {
      xp: 1800,
      coins: 1800,
      xpBoostMs: 60 * 60 * 1000,
      autoClickerMs: 60 * 60 * 1000,
    },
  },
];

export function getPaidPowerup(productId: string): PaidPowerup | undefined {
  return PAID_POWERUPS.find((powerup) => powerup.id === productId);
}
