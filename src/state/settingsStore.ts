import { useSyncExternalStore } from "react";
import { appStorageKey } from "../config/runtime";

export type SettingsState = {
  muted: boolean;
  reducedMotion: boolean;
  compactBoard: boolean;
};

const SETTINGS_KEY = appStorageKey("settings:v1");
const listeners = new Set<() => void>();

let settings: SettingsState = {
  muted: false,
  reducedMotion: false,
  compactBoard: false,
};

function emit() {
  for (const listener of listeners) listener();
}

function save() {
  if (typeof window !== "undefined") window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function initializeSettings() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      settings = { ...settings, ...(JSON.parse(raw) as Partial<SettingsState>) };
    } catch {
      settings = { ...settings };
    }
  }
  settings.reducedMotion = settings.reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  emit();
}

export function updateSettings(patch: Partial<SettingsState>) {
  settings = { ...settings, ...patch };
  save();
  emit();
}

export function getSettingsState() {
  return settings;
}

export function useSettingsState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSettingsState,
    getSettingsState
  );
}
