export type PolymaiSupabaseConfig = {
  appId: string;
  url: string;
  anonKey: string;
  functionsBaseUrl: string;
  siteUrl: string;
  appStoragePrefix: string;
  authStorageKey: string;
};

declare global {
  interface Window {
    __POLYMAI_SUPABASE_CONFIG__?: PolymaiSupabaseConfig;
    __SUPABASE_CONFIG__?: PolymaiSupabaseConfig;
  }
}

export const APP_ID = "app686";
export const APP_NAME = "Merge Empire";
export const APP_SCHEMA = "app686_merge_empire";
export const SAVE_VERSION = 1;

const fallbackConfig: PolymaiSupabaseConfig = {
  appId: "app686",
  url: "https://pfnlebwkbhblytpvaokd.supabase.co",
  anonKey: "sb_publishable_O8CemBWuZAjQDC6gSkNq9Q_wAmDtHiv",
  functionsBaseUrl: "https://pfnlebwkbhblytpvaokd.supabase.co/functions/v1",
  siteUrl: "",
  appStoragePrefix: "polymai:app686:",
  authStorageKey: "polymai:app686:pfnlebwkbhblytpvaokd:auth",
};

export function getRuntimeConfig(): PolymaiSupabaseConfig {
  if (typeof window === "undefined") return fallbackConfig;
  return window.__POLYMAI_SUPABASE_CONFIG__ ?? window.__SUPABASE_CONFIG__ ?? fallbackConfig;
}

export function appStorageKey(key: string): string {
  return `${getRuntimeConfig().appStoragePrefix}${key}`;
}

export function getAuthRedirectTo(): string {
  if (typeof window === "undefined") return fallbackConfig.siteUrl;
  const config = getRuntimeConfig();
  if (config.siteUrl) return config.siteUrl;
  return `${window.location.origin}${window.location.pathname}`;
}
