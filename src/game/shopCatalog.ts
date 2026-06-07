import type { ShopItem } from "../types/game";

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "tiny-icon-pack",
    title: "Tiny Icon Pack",
    description: "Buy two starter smile icons for the board.",
    price: 40,
    kind: "utility",
    spaceRequired: 2,
  },
  {
    id: "happy-icon-crate",
    title: "Happy Icon Crate",
    description: "Buy one upgraded smile so merges move faster.",
    price: 110,
    kind: "utility",
    spaceRequired: 1,
  },
  {
    id: "income-sprint",
    title: "Revenue Sprint",
    description: "Double collection revenue for five minutes.",
    price: 180,
    kind: "booster",
    durationMs: 5 * 60 * 1000,
  },
  {
    id: "launch-discount",
    title: "Launch Discount",
    description: "Reduce spawn cost for five minutes.",
    price: 140,
    kind: "booster",
    durationMs: 5 * 60 * 1000,
  },
  {
    id: "mint-theme",
    title: "Mint Circuit",
    description: "Switch the board glow to a mint-forward palette.",
    price: 320,
    kind: "cosmetic",
  },
  {
    id: "gold-theme",
    title: "Gold Ledger",
    description: "Switch the board glow to a warmer gold palette.",
    price: 520,
    kind: "cosmetic",
  },
];

export function getShopItem(itemId: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === itemId);
}
