import { getStripeConfig } from "../config/stripeRuntime";
import { appDb } from "../lib/supabaseClient";
import type { PaidPowerupEffect } from "../types/game";

export type PowerupPurchaseRow = {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  stripe_session_id: string;
  amount_total: number;
  currency: string;
  status: "fulfilled" | "redeemed";
  effect_payload: PaidPowerupEffect;
  redeemed_at: string | null;
  created_at: string;
};

export async function fetchPowerupPurchases(userId: string): Promise<PowerupPurchaseRow[]> {
  const { data, error } = await appDb
    .from("stripe_powerup_purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PowerupPurchaseRow[];
}

async function parseCheckoutError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; setupRequired?: boolean };
    if (body.setupRequired) return "Paid powerups are not ready yet.";
    return body.error || "Could not start secure checkout.";
  } catch {
    return "Could not start secure checkout.";
  }
}

export async function createPowerupCheckout(productId: string, accessToken: string): Promise<string> {
  const config = getStripeConfig();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;
  const successUrl = `${origin}${pathname}?checkout=success`;
  const cancelUrl = `${origin}${pathname}?checkout=cancel`;
  const response = await fetch(`${config.functionsBaseUrl}/${config.checkoutFunction}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ productId, successUrl, cancelUrl }),
  });
  if (!response.ok) throw new Error(await parseCheckoutError(response));
  const body = (await response.json()) as { url?: string };
  if (!body.url) throw new Error("Secure checkout did not return a redirect URL.");
  return body.url;
}

export async function createPaymentPortal(accessToken: string): Promise<string> {
  const config = getStripeConfig();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const returnUrl = `${origin}${typeof window === "undefined" ? "/" : window.location.pathname}`;
  const response = await fetch(`${config.functionsBaseUrl}/${config.portalFunction}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ returnUrl }),
  });
  if (!response.ok) throw new Error(await parseCheckoutError(response));
  const body = (await response.json()) as { url?: string };
  if (!body.url) throw new Error("Secure payment portal did not return a redirect URL.");
  return body.url;
}

export async function fetchUnredeemedPowerups(userId: string): Promise<PowerupPurchaseRow[]> {
  const { data, error } = await appDb
    .from("stripe_powerup_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "fulfilled")
    .is("redeemed_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PowerupPurchaseRow[];
}

export async function markPowerupRedeemed(purchaseId: string): Promise<void> {
  const { error } = await appDb
    .from("stripe_powerup_purchases")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("id", purchaseId)
    .is("redeemed_at", null);
  if (error) throw error;
}
