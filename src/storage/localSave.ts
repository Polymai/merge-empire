import { appStorageKey, SAVE_VERSION } from "../config/runtime";
import type { GameState, SavePayload } from "../types/game";
import { createInitialGameState } from "../game/initialState";

const GUEST_SAVE_KEY = appStorageKey("guest-save:v1");

export function serializeSave(state: GameState): SavePayload {
  return {
    version: SAVE_VERSION,
    state: {
      ...state,
      version: SAVE_VERSION,
    },
  };
}

export function loadGuestSave(): GameState {
  if (typeof window === "undefined") return createInitialGameState();
  const raw = window.localStorage.getItem(GUEST_SAVE_KEY);
  if (!raw) return createInitialGameState();
  try {
    const parsed = JSON.parse(raw) as SavePayload;
    if (!parsed || parsed.version !== SAVE_VERSION || !parsed.state) return createInitialGameState();
    return parsed.state;
  } catch {
    return createInitialGameState();
  }
}

export function saveGuestState(state: GameState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_SAVE_KEY, JSON.stringify(serializeSave(state)));
}

export function clearGuestSave() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_SAVE_KEY);
}
