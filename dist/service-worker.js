const CACHE_NAME = "merge-empire-shell-v7";
const APP_SHELL = [
  "./index.html",
  "./data/supabaseConfig.js",
  "./data/stripeConfig.js",
  "./assets/favicon.svg",
  "./assets/soft-cloud-background.png",
  "./assets/iconscout-emoji/angry-face.png",
  "./assets/iconscout-emoji/archery.png",
  "./assets/iconscout-emoji/basketball.png",
  "./assets/iconscout-emoji/cold-face.png",
  "./assets/iconscout-emoji/confused-face.png",
  "./assets/iconscout-emoji/confuse-orange.png",
  "./assets/iconscout-emoji/cool-pixel-face.png",
  "./assets/iconscout-emoji/crazy-love.png",
  "./assets/iconscout-emoji/crying-face.png",
  "./assets/iconscout-emoji/smile.png",
  "./assets/iconscout-emoji/happy-face.png",
  "./assets/iconscout-emoji/crying-laugh.png",
  "./assets/iconscout-emoji/cute-apple.png",
  "./assets/iconscout-emoji/cute-watermelon.png",
  "./assets/iconscout-emoji/devil-face.png",
  "./assets/iconscout-emoji/disappointed-face.png",
  "./assets/iconscout-emoji/fire-eyes.png",
  "./assets/iconscout-emoji/football.png",
  "./assets/iconscout-emoji/gold-medal.png",
  "./assets/iconscout-emoji/goofy-face.png",
  "./assets/iconscout-emoji/gymnastic.png",
  "./assets/iconscout-emoji/happy-avocado.png",
  "./assets/iconscout-emoji/happy-carrot.png",
  "./assets/iconscout-emoji/laughing-face.png",
  "./assets/iconscout-emoji/wink-face.png",
  "./assets/iconscout-emoji/tongue-wink.png",
  "./assets/iconscout-emoji/starry-eyes.png",
  "./assets/iconscout-emoji/smiley-glasses.png",
  "./assets/iconscout-emoji/love-eyes.png",
  "./assets/iconscout-emoji/love-money.png",
  "./assets/iconscout-emoji/money-eye.png",
  "./assets/iconscout-emoji/monocle-face.png",
  "./assets/iconscout-emoji/party-face.png",
  "./assets/iconscout-emoji/raised-eyebrow.png",
  "./assets/iconscout-emoji/sad-pensive.png",
  "./assets/iconscout-emoji/sad-tomato.png",
  "./assets/iconscout-emoji/mind-blown.png",
  "./assets/iconscout-emoji/shocked-face.png",
  "./assets/iconscout-emoji/smirking-face.png",
  "./assets/iconscout-emoji/sunglasses-face.png",
  "./assets/iconscout-emoji/twin-baby-carrot.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;
  const url = new URL(request.url);

  if (url.pathname.endsWith("/service-worker.js")) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate" || request.destination === "document" || url.pathname.endsWith("/index.html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        if (request.mode === "navigate") return caches.match("./index.html");
        return undefined;
      });
    })
  );
});
