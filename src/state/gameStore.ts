import { useSyncExternalStore } from "react";
import type { GameAction, GameState, LeaderboardEntry, LeaderboardPeriod } from "../types/game";
import { createInitialGameState } from "../game/initialState";
import { emptyCells, reduceGame } from "../game/gameReducer";
import { formatNumber, spawnCost } from "../game/economy";
import { getShopItem } from "../game/shopCatalog";
import { clearGuestSave, loadGuestSave, saveGuestState } from "../storage/localSave";
import { loadCloudSave, saveCloudState } from "../services/saveApi";
import { fetchLeaderboard, publishLeaderboardSnapshot } from "../services/leaderboardApi";
import { fetchUnredeemedPowerups, markPowerupRedeemed } from "../services/paymentApi";

export type GameStoreState = {
  game: GameState;
  status: "idle" | "loading" | "saving" | "publishing";
  message: string;
  error: string;
  leaderboard: LeaderboardEntry[];
  leaderboardPeriod: LeaderboardPeriod;
};

const listeners = new Set<() => void>();

let store: GameStoreState = {
  game: createInitialGameState(),
  status: "idle",
  message: "",
  error: "",
  leaderboard: [],
  leaderboardPeriod: "global",
};

function emit() {
  for (const listener of listeners) listener();
}

function setStore(patch: Partial<GameStoreState>) {
  store = { ...store, ...patch };
  emit();
}

let initialized = false;

export function initializeGame() {
  if (initialized) return;
  initialized = true;
  setStore({ game: loadGuestSave(), status: "idle" });
}

function unchangedActionMessage(state: GameState, action: GameAction): string {
  if (action.type === "spawn") {
    const cost = spawnCost(state);
    if (!emptyCells(state).length) return "Board is full. Merge matching icons first.";
    if (state.coins < cost) return `Need ${formatNumber(cost - state.coins)} more coins to buy an icon.`;
    return "No icon was bought.";
  }

  if (action.type === "buyShopItem") {
    const item = getShopItem(action.itemId);
    if (!item) return "That shop item is not available.";
    if (item.disabled) return "That pack is reserved for a future release.";
    if ((item.id === "mint-theme" && state.activeTheme === "mint") || (item.id === "gold-theme" && state.activeTheme === "gold")) {
      return "That board theme is already active.";
    }
    if (item.spaceRequired && emptyCells(state).length < item.spaceRequired) {
      return `Need ${item.spaceRequired} empty board cells for ${item.title}.`;
    }
    if (state.coins < item.price) return `Need ${formatNumber(item.price - state.coins)} more coins for ${item.title}.`;
    return `${item.title} could not be purchased.`;
  }

  return "";
}

function completedActionMessage(before: GameState, action: GameAction): string {
  if (action.type === "spawn") return `Bought one icon for ${formatNumber(spawnCost(before))} coins.`;
  if (action.type === "buyShopItem") {
    const item = getShopItem(action.itemId);
    return item ? `Purchased ${item.title}.` : "";
  }
  if (action.type === "applyPaidPowerup") return "Powerup added to your board.";
  if (action.type === "claimDaily") return "Daily reward claimed.";
  if (action.type === "claimMission") return "Mission reward claimed.";
  return "";
}

export function dispatchGame(action: GameAction) {
  const previous = store.game;
  const game = reduceGame(previous, action);
  if (game === previous) {
    setStore({ game, error: unchangedActionMessage(previous, action), message: "" });
    return;
  }
  setStore({ game, error: "", message: completedActionMessage(previous, action) });
  saveGuestState(game);
}

export async function loadGameForUser(userId: string) {
  setStore({ status: "loading", error: "", message: "" });
  try {
    const cloud = await loadCloudSave(userId);
    if (cloud) {
      setStore({ game: cloud, status: "idle", message: "Cloud save loaded.", error: "" });
      saveGuestState(cloud);
    } else {
      setStore({ status: "idle", message: "Guest save is ready to sync.", error: "" });
    }
  } catch (error) {
    setStore({
      status: "idle",
      error: error instanceof Error ? error.message : "Could not load cloud save.",
    });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function redeemPaidPowerups(userId: string, retryAttempts = 1): Promise<number> {
  let purchases = await fetchUnredeemedPowerups(userId);
  for (let attempt = 1; attempt < retryAttempts && purchases.length === 0; attempt += 1) {
    await delay(1200);
    purchases = await fetchUnredeemedPowerups(userId);
  }
  if (!purchases.length) return 0;

  for (const purchase of purchases) {
    dispatchGame({ type: "applyPaidPowerup", purchaseId: purchase.id, effect: purchase.effect_payload });
    await markPowerupRedeemed(purchase.id);
  }
  await saveCloudState(userId, store.game);
  setStore({ message: `${purchases.length} paid powerup${purchases.length === 1 ? "" : "s"} added.`, error: "" });
  return purchases.length;
}

export async function saveGameForUser(userId: string) {
  setStore({ status: "saving", error: "", message: "" });
  try {
    await saveCloudState(userId, store.game);
    setStore({ status: "idle", message: "Cloud save synced.", error: "" });
  } catch (error) {
    setStore({
      status: "idle",
      error: error instanceof Error ? error.message : "Could not sync cloud save.",
    });
  }
}

export async function publishScore(displayName: string) {
  setStore({ status: "publishing", error: "", message: "" });
  try {
    await Promise.all([
      publishLeaderboardSnapshot(store.game, displayName, "global"),
      publishLeaderboardSnapshot(store.game, displayName, "weekly"),
      publishLeaderboardSnapshot(store.game, displayName, "monthly"),
    ]);
    const leaderboard = await fetchLeaderboard(store.leaderboardPeriod);
    setStore({ leaderboard, status: "idle", message: "Leaderboard updated.", error: "" });
  } catch (error) {
    setStore({
      status: "idle",
      error: error instanceof Error ? error.message : "Could not publish score.",
    });
  }
}

export async function refreshLeaderboard(period: LeaderboardPeriod) {
  setStore({ status: "loading", leaderboardPeriod: period, error: "" });
  try {
    const leaderboard = await fetchLeaderboard(period);
    setStore({ leaderboard, status: "idle" });
  } catch {
    setStore({ leaderboard: [], status: "idle", error: "" });
  }
}

export function resetGuestGame() {
  const game = createInitialGameState();
  clearGuestSave();
  saveGuestState(game);
  setStore({ game, message: "Guest board reset.", error: "" });
}

export function getGameStoreState() {
  return store;
}

export function useGameStoreState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getGameStoreState,
    getGameStoreState
  );
}
