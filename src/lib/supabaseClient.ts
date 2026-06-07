import { createClient } from "@supabase/supabase-js";
import { APP_SCHEMA, getRuntimeConfig } from "../config/runtime";

const runtimeConfig = getRuntimeConfig();

export const supabase = createClient(runtimeConfig.url, runtimeConfig.anonKey, {
  auth: {
    storageKey: runtimeConfig.authStorageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const appDb = supabase.schema(APP_SCHEMA);
