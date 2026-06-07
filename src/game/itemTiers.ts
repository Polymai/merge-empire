import type { ItemShape, ItemTier, LottieIconKind } from "../types/game";

type TierSeed = [name: string, symbol: string, tagline: string];

const tierSeeds: TierSeed[] = [
  ["Tiny Smile", "🙂", "A small face with room to grow."],
  ["Bright Smile", "😀", "The first upgrade feels bigger immediately."],
  ["Happy Smile", "😃", "More expression, better payouts."],
  ["Mega Grin", "😄", "A wide grin with a stronger coin pulse."],
  ["Spark Face", "🤩", "A starry icon that starts to look premium."],
  ["Party Face", "🥳", "The board begins to celebrate every match."],
  ["Cool Face", "😎", "A confident mascot with faster earnings."],
  ["Crown Face", "👑", "The smile graduates into a tiny crown."],
  ["Bronze Badge", "🥉", "A compact badge with visible rank."],
  ["Silver Badge", "🥈", "A cleaner badge with sharper rewards."],
  ["Gold Badge", "🥇", "A bright milestone for early players."],
  ["Gem Badge", "💎", "A glossy icon with better revenue density."],
  ["Mini Cart", "🛒", "Small demand starts moving across the board."],
  ["Pop-Up Shop", "🏪", "A real storefront replaces the starter face."],
  ["Coin Counter", "🪙", "Money becomes the icon itself."],
  ["Gift Kiosk", "🎁", "A compact upgrade with reward energy."],
  ["Tool Desk", "🧰", "Useful gear starts scaling the operation."],
  ["Design Desk", "🎨", "Color and polish raise the tier identity."],
  ["Music Booth", "🎧", "A brighter booth that pays on rhythm."],
  ["Arcade Pod", "🕹️", "A playful pod with stronger idle value."],
  ["Delivery Van", "🚚", "The first icon that feels mobile."],
  ["Launch Bike", "🛵", "A faster delivery loop for bigger boards."],
  ["Smart Cafe", "☕", "A small social hub with steady income."],
  ["Glow Lab", "🧪", "Experiments turn into coin-positive loops."],
  ["Creator Hub", "🎬", "Content becomes a durable upgrade."],
  ["Signal Hub", "📡", "The board starts broadcasting value."],
  ["Data Core", "💾", "Storage and signals stack into worth."],
  ["Circuit Lab", "🔌", "Power flows through every merge."],
  ["Robot Desk", "🤖", "Automation joins the merge chain."],
  ["Sky Pad", "🛸", "The icons now feel beyond street level."],
  ["Rocket Cart", "🚀", "Launch energy pushes the next band."],
  ["Solar Roof", "☀️", "A bright asset with cleaner revenue."],
  ["Cloud Office", "☁️", "The operation floats above the city."],
  ["Finance Vault", "🏦", "A heavier icon with serious payouts."],
  ["Media Tower", "📺", "Attention turns into an asset class."],
  ["Cyber Shield", "🛡️", "Protection becomes profitable."],
  ["Talent Stage", "🎤", "Bigger teams make the icon louder."],
  ["Factory Bay", "🏭", "Production now fills the tile."],
  ["Commerce Grid", "🧭", "The board connects demand in every direction."],
  ["Capital Tower", "🏢", "A tall icon that reads as a real upgrade."],
  ["AI Concierge", "🧠", "Smart service scales the whole board."],
  ["Quantum Gate", "🔷", "A sharp gate into late-game value."],
  ["Logistics Ring", "🔗", "Every route feeds the next one."],
  ["Green Foundry", "♻️", "Efficient loops raise the coin floor."],
  ["Studio Campus", "🏛️", "One icon now implies a whole campus."],
  ["Venture Bank", "💰", "Capital gets dense and easy to read."],
  ["Signal Exchange", "📈", "Market shifts become playable progress."],
  ["Nano Factory", "⚙️", "Small parts create massive output."],
  ["Cloud District", "🌐", "The empire spreads across networks."],
  ["Orbit Market", "🛰️", "Commerce reaches above the skyline."],
  ["Fusion Lab", "⚛️", "Energy unlocks a new reward band."],
  ["Holo Retail", "🔮", "The icon starts to feel rare."],
  ["Deeptech Campus", "🧬", "Research stacks into a visual trophy."],
  ["Moonshot Studio", "🌙", "A late-game target with clear scale."],
  ["Empire Exchange", "🏙️", "The city itself becomes the tile."],
  ["Neon Megastore", "🌆", "A landmark upgrade with heavy glow."],
  ["Orbital Holdings", "🪐", "Portfolio gravity bends the board."],
  ["Singularity Bank", "✨", "A tiny sparkle carrying huge value."],
  ["Infinity Market", "♾️", "Demand loops without a ceiling."],
  ["Crown Empire", "👑", "The final icon owns the whole run."],
];

const palettes = [
  "from-cyan-300 to-blue-500",
  "from-fuchsia-300 to-pink-500",
  "from-emerald-300 to-teal-500",
  "from-amber-200 to-orange-500",
  "from-violet-300 to-indigo-500",
  "from-rose-200 to-red-500",
];

const iconProgression: Array<{ lottie: LottieIconKind; shape: ItemShape }> = [
  { lottie: "smile", shape: "circle" },
  { lottie: "spark", shape: "flower" },
  { lottie: "heart", shape: "drop" },
  { lottie: "coin", shape: "pill" },
  { lottie: "gift", shape: "ticket" },
  { lottie: "bag", shape: "bubble" },
  { lottie: "brush", shape: "drop" },
  { lottie: "tools", shape: "gem" },
  { lottie: "rocket", shape: "gem" },
  { lottie: "trophy", shape: "flower" },
  { lottie: "crown", shape: "circle" },
  { lottie: "gem", shape: "bubble" },
];

export const ITEM_TIERS: ItemTier[] = tierSeeds.map(([name, symbol, tagline], index) => {
  const iconStep = iconProgression[index % iconProgression.length];

  return {
    tier: index + 1,
    name,
    symbol,
    lottie: iconStep.lottie,
    shape: iconStep.shape,
    tagline,
    palette: palettes[index % palettes.length],
    revenue: Math.round(10 * Math.pow(index + 1, 1.9) + index * 10),
    xp: Math.round(5 * Math.pow(index + 1, 1.32)),
  };
});

export const MAX_TIER = ITEM_TIERS.length;

export function getTier(tier: number): ItemTier {
  return ITEM_TIERS[Math.max(0, Math.min(ITEM_TIERS.length - 1, tier - 1))];
}

export function getUnlockedTiers(highestTier: number): ItemTier[] {
  return ITEM_TIERS.slice(0, Math.max(1, Math.min(highestTier, ITEM_TIERS.length)));
}
