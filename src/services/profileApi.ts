import { appDb } from "../lib/supabaseClient";

export type PlayerProfile = {
  id: string;
  display_name: string;
  avatar_hue: number;
  created_at: string;
  updated_at: string;
  last_seen_at: string;
};

function defaultDisplayName(email?: string): string {
  if (!email) return "Neon Founder";
  return email.split("@")[0]?.replace(/[-_.]+/g, " ").slice(0, 32) || "Neon Founder";
}

export async function fetchProfile(userId: string): Promise<PlayerProfile | null> {
  const { data, error } = await appDb.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as PlayerProfile | null;
}

export async function bootstrapPlayerProfile(displayName?: string): Promise<PlayerProfile> {
  const { data, error } = await appDb
    .rpc("bootstrap_profile", { p_display_name: displayName || "Neon Founder" })
    .single();
  if (error) throw error;
  return data as PlayerProfile;
}

export async function ensureProfile(userId: string, email?: string): Promise<PlayerProfile> {
  const existing = await fetchProfile(userId);
  if (existing) return existing;
  return bootstrapPlayerProfile(defaultDisplayName(email));
}

export async function updateProfileName(displayName: string): Promise<PlayerProfile> {
  const { data, error } = await appDb
    .rpc("bootstrap_profile", { p_display_name: displayName.trim() || "Neon Founder" })
    .single();
  if (error) throw error;
  return data as PlayerProfile;
}
