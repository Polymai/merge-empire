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
import { loadGameForUser, refreshLeaderboard, saveGameForUser, useGameStoreState } from "./state/gameStore";
import { initializeAuth, useAuthState } from "./state/authStore";
import { initializeGame } from "./state/gameStore";
import { initializeSettings, updateSettings, useSettingsState } from "./state/settingsStore";
import { useFullscreen } from "./hooks/useFullscreen";

const navItems: { id: ViewId; label: string; icon: typeof Gamepad2 }[] = [
  { id: "play", label: "Play", icon: Gamepad2 },
  { id: "missions", label: "Missions", icon: Award },
  { id: "leaderboard", label: "Rankings", icon: Trophy },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "account", label: "Account", icon: User },
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>("play");
  const auth = useAuthState();
  const store = useGameStoreState();
  const settings = useSettingsState();
  const fullscreen = useFullscreen();

  useEffect(() => {
    initializeSettings();
    initializeGame();
    void initializeAuth();
    void refreshLeaderboard("global");
  }, []);

  useEffect(() => {
    if (auth.user) void loadGameForUser(auth.user.id);
  }, [auth.user?.id]);

  useEffect(() => {
    if (settings.muted) stopAmbient();
    return () => stopAmbient();
  }, [settings.muted]);

  const loaderLabel = useMemo(() => {
    if (auth.status === "loading") return "Restoring player session";
    if (auth.status === "working") return "Updating player profile";
    if (store.status === "saving") return "Syncing cloud save";
    if (store.status === "publishing") return "Publishing ranking";
    return "Loading";
  }, [auth.status, store.status]);

  const showLoader = auth.status === "loading" || auth.status === "working" || store.status === "saving" || store.status === "publishing";

  return (
    <div className={`app-shell ${settings.compactBoard ? "is-compact" : ""}`}>
      <HeaderBar
        activeView={activeView}
        auth={auth}
        settings={settings}
        navItems={navItems}
        onViewChange={setActiveView}
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
          {activeView === "shop" ? <ShopPanel game={store.game} /> : null}
          {activeView === "account" ? <AccountPanel auth={auth} settings={settings} /> : null}
        </motion.div>

        {(store.message || store.error || auth.error) && (
          <div className={store.error || auth.error ? "toast is-error" : "toast"} role="status">
            {store.error || auth.error || store.message}
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
