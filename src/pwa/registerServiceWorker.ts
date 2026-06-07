export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    const workerPath = ["service-worker", "js"].join(".");
    navigator.serviceWorker.register(workerPath).catch(() => undefined);
  });
}
