import { FormEvent, useEffect, useState } from "react";
import { Clock, History, LogOut, Receipt, Save, Settings, User } from "lucide-react";
import type { AuthState } from "../state/authStore";
import { signOut, updateProfileName } from "../state/authStore";
import { saveGameForUser } from "../state/gameStore";
import type { SettingsState } from "../state/settingsStore";
import { updateSettings } from "../state/settingsStore";
import { fetchPowerupPurchases, type PowerupPurchaseRow } from "../services/paymentApi";

type AccountPanelProps = {
  auth: AuthState;
  settings: SettingsState;
  onOpenPaymentPortal: () => void;
};

function formatMoney(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function AccountPanel({ auth, settings, onOpenPaymentPortal }: AccountPanelProps) {
  const [displayName, setDisplayName] = useState(auth.profile?.display_name || "");
  const [purchaseHistory, setPurchaseHistory] = useState<PowerupPurchaseRow[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    if (!auth.user) {
      setPurchaseHistory([]);
      setPurchaseError("");
      setPurchaseLoading(false);
      return;
    }

    let cancelled = false;
    setPurchaseLoading(true);
    setPurchaseError("");
    void (async () => {
      try {
        const purchases = await fetchPowerupPurchases(auth.user!.id);
        if (!cancelled) setPurchaseHistory(purchases);
      } catch (error) {
        if (!cancelled) {
          setPurchaseError(error instanceof Error ? error.message : "Could not load purchase history.");
        }
      } finally {
        if (!cancelled) setPurchaseLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth.user?.id]);

  useEffect(() => {
    setDisplayName(auth.profile?.display_name || "");
  }, [auth.profile?.display_name]);

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
        <>
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
            <button type="button" className="secondary-button" onClick={onOpenPaymentPortal}>
              <Receipt aria-hidden="true" />
              Stripe-konto
            </button>
            <button type="button" className="secondary-button" onClick={onOpenPaymentPortal}>
              <History aria-hidden="true" />
              Visa betalningar
            </button>
            <button type="button" className="text-button" onClick={() => void signOut()}>
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </form>

          <div className="account-section">
            <p className="section-kicker">Purchases</p>
            <div className="panel-heading">
              <h3>Recent powerup purchases</h3>
              <Clock aria-hidden="true" className="panel-icon" />
            </div>

            {purchaseLoading ? <p className="inline-note">Loading purchase history...</p> : null}
            {purchaseError ? <p className="inline-note error-note">{purchaseError}</p> : null}

            {!purchaseLoading && !purchaseError ? (
              <div className="shop-grid">
                {purchaseHistory.length === 0 ? (
                  <p className="inline-note">No purchases yet. Open Stripe account or make your first purchase.</p>
                ) : (
                  purchaseHistory.slice(0, 4).map((purchase) => (
                    <article key={purchase.id} className="shop-item">
                      <div>
                        <span>{purchase.status === "redeemed" ? "Used" : "Ready"}</span>
                        <h3>{purchase.product_title}</h3>
                        <p>{formatMoney(purchase.amount_total, purchase.currency)}</p>
                        <p className="shop-meta">{formatDate(purchase.created_at)}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </>
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
