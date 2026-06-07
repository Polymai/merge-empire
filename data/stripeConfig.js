// Polymai runtime Stripe config.
// Frontend-safe only: publishable key, mode, public Functions base URL, and public product ids.
// Never add Stripe secret keys, restricted keys, webhook secrets, or service role keys here.
(function () {
  const config = Object.freeze({
    mode: "test",
    publishableKey: "",
    functionsBaseUrl: "https://pfnlebwkbhblytpvaokd.supabase.co/functions/v1",
    checkoutFunction: "create-checkout-session",
    portalFunction: "create-customer-portal",
    sweOrgNumber: "SE-000000-0000",
    vatPercent: 25,
    products: Object.freeze(["level-cloud-boost", "auto-helper", "founder-bundle"]),
  });
  window.__POLYMAI_STRIPE_CONFIG__ = config;
})();
