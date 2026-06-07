import { useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthRedirectTo } from "../config/runtime";
import { supabase } from "../lib/supabaseClient";
import {
  bootstrapPlayerProfile,
  ensureProfile,
  type PlayerProfile,
  updateProfileName as updateRemoteProfileName,
} from "../services/profileApi";

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: PlayerProfile | null;
  status: "loading" | "guest" | "ready" | "working";
  message: string;
  error: string;
};

const listeners = new Set<() => void>();

let authState: AuthState = {
  session: null,
  user: null,
  profile: null,
  status: "loading",
  message: "",
  error: "",
};

function emit() {
  for (const listener of listeners) listener();
}

function setAuthState(patch: Partial<AuthState>) {
  authState = { ...authState, ...patch };
  emit();
}

function mapAuthError(message: string): string {
  if (/already|registered|exists/i.test(message)) {
    return "This email may already work for sign-in. Sign in instead, or reset your password.";
  }
  if (/invalid login|credentials/i.test(message)) return "The email or password did not match.";
  return message;
}

async function attachSession(session: Session | null) {
  if (!session?.user) {
    setAuthState({ session: null, user: null, profile: null, status: "guest", message: "", error: "" });
    return;
  }
  try {
    const profile = await ensureProfile(session.user.id, session.user.email);
    setAuthState({ session, user: session.user, profile, status: "ready", message: "", error: "" });
  } catch (error) {
    setAuthState({
      session,
      user: session.user,
      profile: null,
      status: "ready",
      error: error instanceof Error ? error.message : "Could not load player profile.",
    });
  }
}

let initialized = false;

export async function initializeAuth() {
  if (initialized) return;
  initialized = true;
  setAuthState({ status: "loading" });
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setAuthState({ status: "guest", error: mapAuthError(error.message) });
  } else {
    await attachSession(data.session);
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    void attachSession(session);
  });
}

export async function signIn(email: string, password: string) {
  setAuthState({ status: "working", error: "", message: "" });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setAuthState({ status: authState.session ? "ready" : "guest", error: mapAuthError(error.message) });
    return;
  }
  await attachSession(data.session);
}

export async function signUp(email: string, password: string, displayName: string) {
  setAuthState({ status: "working", error: "", message: "" });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectTo(),
      data: {
        app_id: "app686",
        display_name: displayName,
      },
    },
  });
  if (error) {
    setAuthState({ status: "guest", error: mapAuthError(error.message) });
    return;
  }
  if (data.session) {
    const profile = await bootstrapPlayerProfile(displayName);
    setAuthState({ session: data.session, user: data.session.user, profile, status: "ready", message: "", error: "" });
  } else {
    setAuthState({
      session: null,
      user: null,
      profile: null,
      status: "guest",
      message: "Check your email, then return here to finish your empire save.",
      error: "",
    });
  }
}

export async function signOut() {
  setAuthState({ status: "working", error: "", message: "" });
  await supabase.auth.signOut();
  setAuthState({ session: null, user: null, profile: null, status: "guest", message: "", error: "" });
}

export async function updateProfileName(displayName: string) {
  if (!authState.user) return;
  setAuthState({ status: "working", error: "", message: "" });
  try {
    const profile = await updateRemoteProfileName(displayName);
    setAuthState({ profile, status: "ready", message: "Founder name updated.", error: "" });
  } catch (error) {
    setAuthState({
      status: "ready",
      error: error instanceof Error ? error.message : "Could not update founder name.",
    });
  }
}

export function getAuthState() {
  return authState;
}

export function useAuthState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getAuthState,
    getAuthState
  );
}
