import { Maximize2, Music, VolumeX } from "lucide-react";
import type { AuthState } from "../state/authStore";
import type { SettingsState } from "../state/settingsStore";

export type ViewId = "play" | "missions" | "leaderboard" | "shop" | "account";

type NavItem = {
  id: ViewId;
  label: string;
};

type HeaderBarProps = {
  activeView: ViewId;
  auth: AuthState;
  settings: SettingsState;
  navItems: NavItem[];
  onViewChange: (view: ViewId) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
};

export function HeaderBar({
  activeView,
  auth,
  settings,
  navItems,
  onViewChange,
  onToggleMute,
  onToggleFullscreen,
}: HeaderBarProps) {
  return (
    <header className="topbar">
      <button className="wordmark" type="button" onClick={() => onViewChange("play")} aria-label="Merge Empire home">
        <span className="wordmark__main">Merge</span>
        <span className="wordmark__accent">Empire</span>
      </button>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeView ? "nav-pill is-active" : "nav-pill"}
            onClick={() => onViewChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <div className="profile-chip" aria-label={auth.user ? "Signed in player" : "Guest player"}>
          {auth.profile?.display_name || "Guest founder"}
        </div>
        <button className="icon-button" type="button" onClick={onToggleMute} aria-label="Toggle sound" title="Toggle sound">
          {settings.muted ? <VolumeX aria-hidden="true" /> : <Music aria-hidden="true" />}
        </button>
        <button className="icon-button" type="button" onClick={onToggleFullscreen} aria-label="Toggle fullscreen" title="Fullscreen">
          <Maximize2 aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
