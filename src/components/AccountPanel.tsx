import { FormEvent, useState } from "react";
import { LogOut, Save, Settings, User } from "lucide-react";
import type { AuthState } from "../state/authStore";
import { signOut, updateProfileName } from "../state/authStore";
import { saveGameForUser } from "../state/gameStore";
import type { SettingsState } from "../state/settingsStore";
import { updateSettings } from "../state/settingsStore";

type AccountPanelProps = {
  auth: AuthState;
  settings: SettingsState;
};

export function AccountPanel({ auth, settings }: AccountPanelProps) {
  const [displayName, setDisplayName] = useState(auth.profile?.display_name || "");

  function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void updateProfileName(displayName);
  }

  return (
    <section className="glass-panel" aria-labelledby="account-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Account</p>
          <h2 id="account-title">Player controls</h2>
        </div>
        <Settings aria-hidden="true" className="panel-icon" />
      </div>

      {auth.user ? (
        <form className="account-grid" onSubmit={handleProfile}>
          <label htmlFor="account-display-name">
            Founder name
            <input
              id="account-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-label="Founder name"
            />
          </label>
          <button type="submit" className="secondary-button">
            <User aria-hidden="true" />
            Update
          </button>
          <button type="button" className="secondary-button" onClick={() => void saveGameForUser(auth.user!.id)}>
            <Save aria-hidden="true" />
            Sync save
          </button>
          <button type="button" className="text-button" onClick={() => void signOut()}>
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        </form>
      ) : (
        <p className="inline-note">Guest play is active. Create a profile to sync progress and publish rankings.</p>
      )}

      <div className="settings-list">
        <label className="toggle-row">
          <span>Mute audio</span>
          <input
            type="checkbox"
            checked={settings.muted}
            onChange={(event) => updateSettings({ muted: event.target.checked })}
            aria-label="Mute audio"
          />
        </label>
        <label className="toggle-row">
          <span>Reduced motion</span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => updateSettings({ reducedMotion: event.target.checked })}
            aria-label="Reduced motion"
          />
        </label>
        <label className="toggle-row">
          <span>Compact board</span>
          <input
            type="checkbox"
            checked={settings.compactBoard}
            onChange={(event) => updateSettings({ compactBoard: event.target.checked })}
            aria-label="Compact board"
          />
        </label>
      </div>
    </section>
  );
}
