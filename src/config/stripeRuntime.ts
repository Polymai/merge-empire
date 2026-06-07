import { getRuntimeConfig } from "./runtime";

export type PolymaiStripeConfig = {
  mode: "test" | "live";
  publishableKey: string;
  functionsBaseUrl: string;
  checkoutFunction: string;
  portalFunction: string;
  sweOrgNumber: string;
  vatPercent: number;
  products: string[];
};

declare global {
  interface Window {
    __POLYMAI_STRIPE_CONFIG__?: PolymaiStripeConfig;
  }
}

export function getStripeConfig(): PolymaiStripeConfig {
  if (typeof window !== "undefined" && window.__POLYMAI_STRIPE_CONFIG__) return window.__POLYMAI_STRIPE_CONFIG__;
  return {
    mode: "test",
    publishableKey: "",
    functionsBaseUrl: getRuntimeConfig().functionsBaseUrl,
    checkoutFunction: "create-checkout-session",
    portalFunction: "create-customer-portal",
    sweOrgNumber: "SE-000000-0000",
    vatPercent: 25,
    products: ["level-cloud-boost", "auto-helper", "founder-bundle"],
  };
}
