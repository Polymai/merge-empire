import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Gamepad2, ShoppingBag, Trophy, User } from "lucide-react";
import { AccountPanel } from "./components/AccountPanel";
import { AppLoader } from "./components/AppLoader";
import { AuthPanel } from "./components/AuthPanel";
import { GameBoard } from "./components/GameBoard";
import { HeaderBar, type ViewId } from "./components/HeaderBar";
import { HeroPanel } from "./components/HeroPanel";
import { LeaderboardPanel } from "./components/LeaderboardPanel";
import { MissionPanel } from "./components/MissionPanel";
import { ShopPanel } from "./components/ShopPanel";
import { startAmbient, stopAmbient } from "./audio/audioEngine";
import {
  dispatchGame,
  loadGameForUser,
  redeemPaidPowerups,
  refreshLeaderboard,
  saveGameForUser,
  useGameStoreState,
} from "./state/gameStore";
import { initializeAuth, useAuthState } from "./state/authStore";
import { initializeGame } from "./state/gameStore";
import { initializeSettings, updateSettings, useSettingsState } from "./state/settingsStore";
import { useFullscreen } from "./hooks/useFullscreen";
import { createPaymentPortal, createPowerupCheckout } from "./services/paymentApi";
import { getStripeConfig } from "./config/stripeRuntime";

const navItems: { id: ViewId; label: string; icon: typeof Gamepad2 }[] = [
  { id: "play", label: "Play", icon: Gamepad2 },
  { id: "missions", label: "Missions", icon: Award },
  { id: "leaderboard", label: "Rankings", icon: Trophy },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "account", label: "Account", icon: User },
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>("play");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentNoticeAction, setPaymentNoticeAction] = useState<"openPayments" | null>(null);
  const auth = useAuthState();
  const store = useGameStoreState();
  const settings = useSettingsState();
  const fullscreen = useFullscreen();
  const stripeConfig = getStripeConfig();

  useEffect(() => {
    initializeSettings();
    initializeGame();
    void initializeAuth();
    void refreshLeaderboard("global");
  }, []);

  useEffect(() => {
    if (!auth.user) return;
    const userId = auth.user.id;
    void loadGameForUser(userId).then(() => {
      const checkoutState = new URLSearchParams(window.location.search).get("checkout");

      if (checkoutState === "cancel") {
        setCheckoutBusy(false);
        setPaymentNotice("Köpet avbröts.");
        setPaymentNoticeAction(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        return;
      }

      if (!checkoutState) return;

      void redeemPaidPowerups(userId, checkoutState === "success" ? 8 : 1).then((count) => {
        if (checkoutState === "success") {
          setPaymentNotice(
            count > 0
              ? "Köpet är registrerat och powerups har lagts till."
              : "Betalningen är klar. Öppna \"Betalningar\" om det inte syns direkt."
          );
          setPaymentNoticeAction("openPayments");
        }

        setCheckoutBusy(false);
        setPaymentNoticeAction((prev) => (checkoutState === "success" ? prev : null));

        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      });
    });
  }, [auth.user?.id]);

  useEffect(() => {
    if (settings.muted) stopAmbient();
    return () => stopAmbient();
  }, [settings.muted]);

  useEffect(() => {
    if (store.game.boosts.autoClickerUntil <= Date.now()) return undefined;
    const timer = window.setInterval(() => dispatchGame({ type: "autoTick" }), 3500);
    return () => window.clearInterval(timer);
  }, [store.game.boosts.autoClickerUntil]);

  const loaderLabel = useMemo(() => {
    if (auth.status === "loading") return "Återupptar session";
    if (auth.status === "working") return "Uppdaterar profil";
    if (store.status === "saving") return "Sparar till molnet";
    if (store.status === "publishing") return "Publicerar ranking";
    if (checkoutBusy) return "Öppnar betalning";
    return "Laddar";
  }, [auth.status, checkoutBusy, store.status]);

  const showLoader =
    auth.status === "loading" ||
    auth.status === "working" ||
    store.status === "saving" ||
    store.status === "publishing" ||
    checkoutBusy;

  async function handleBuyPowerup(productId: string) {
    setPaymentError("");
    setPaymentNotice("");
    setPaymentNoticeAction(null);
    if (!auth.session) {
      setActiveView("account");
      setPaymentError("Logga in för att köpa powerups.");
      return;
    }
    setCheckoutBusy(true);
    try {
      const checkoutUrl = await createPowerupCheckout(productId, auth.session.access_token);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Det gick inte att öppna säker betalning.");
      setCheckoutBusy(false);
    }
  }

  async function handleOpenPaymentPortal() {
    setPaymentError("");
    setPaymentNotice("");
    setPaymentNoticeAction(null);
    if (!auth.session) {
      setActiveView("account");
      setPaymentError("Logga in för att öppna betalningshistoriken.");
      return;
    }
    setCheckoutBusy(true);
    try {
      const portalUrl = await createPaymentPortal(auth.session.access_token);
      window.location.assign(portalUrl);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Det gick inte att öppna betalningshistoriken.");
      setCheckoutBusy(false);
    }
  }

  return (
    <div className={`app-shell ${settings.compactBoard ? "is-compact" : ""}`}>
      <HeaderBar
        activeView={activeView}
        auth={auth}
        settings={settings}
        navItems={navItems}
        onViewChange={setActiveView}
        canAccessPayments={Boolean(auth.session)}
        onOpenPaymentPortal={() => void handleOpenPaymentPortal()}
        onToggleMute={() => {
          if (settings.muted) startAmbient(false);
          else stopAmbient();
          updateSettings({ muted: !settings.muted });
        }}
        onToggleFullscreen={() => void fullscreen.toggleFullscreen()}
      />

      <main className="main-layout">
        <HeroPanel game={store.game} onPrimary={() => setActiveView("play")} onLeaderboard={() => setActiveView("leaderboard")} />

        <motion.div
          key={activeView}
          initial={settings.reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={settings.reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="workspace"
        >
          {activeView === "play" ? (
            <div className="play-grid">
              <GameBoard
                game={store.game}
                muted={settings.muted}
                canSaveCloud={Boolean(auth.user)}
                onSaveCloud={() => (auth.user ? void saveGameForUser(auth.user.id) : setActiveView("account"))}
              />
              <AuthPanel auth={auth} />
            </div>
          ) : null}
          {activeView === "missions" ? <MissionPanel game={store.game} /> : null}
          {activeView === "leaderboard" ? <LeaderboardPanel auth={auth} /> : null}
          {activeView === "shop" ? (
            <ShopPanel
              game={store.game}
              canBuyPowerups={Boolean(auth.session)}
              onBuyPowerup={(productId) => void handleBuyPowerup(productId)}
              onRequireAuth={() => setActiveView("account")}
              onOpenPaymentPortal={() => void handleOpenPaymentPortal()}
              organizationNumber={stripeConfig.sweOrgNumber}
              vatPercent={stripeConfig.vatPercent}
            />
          ) : null}
          {activeView === "account" ? <AccountPanel auth={auth} settings={settings} onOpenPaymentPortal={() => void handleOpenPaymentPortal()} /> : null}
        </motion.div>

        {(store.message || store.error || auth.error || paymentNotice || paymentError) && (
          <div className={store.error || auth.error || paymentError ? "toast is-error" : "toast"} role="status">
            {store.error || auth.error || paymentError || paymentNotice || store.message}
            {store.error || auth.error || paymentError || !paymentNotice ? null : (
              <button
                type="button"
                className="text-button toast-action"
                onClick={() => {
                  if (paymentNoticeAction === "openPayments") void handleOpenPaymentPortal();
                }}
              >
                Visa betalningar
              </button>
            )}
          </div>
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={item.id === activeView ? "is-active" : ""}
              onClick={() => setActiveView(item.id)}
              aria-label={item.label}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <AppLoader visible={showLoader} label={loaderLabel} />
    </div>
  );
}

