import { RefreshCw, Send, Trophy } from "lucide-react";
import type { AuthState } from "../state/authStore";
import { publishScore, refreshLeaderboard, useGameStoreState } from "../state/gameStore";
import type { LeaderboardPeriod } from "../types/game";
import { formatNumber } from "../game/economy";

type LeaderboardPanelProps = {
  auth: AuthState;
};

const periods: LeaderboardPeriod[] = ["global", "weekly", "monthly"];

export function LeaderboardPanel({ auth }: LeaderboardPanelProps) {
  const store = useGameStoreState();
  const displayName = auth.profile?.display_name || "Neon Founder";

  return (
    <section className="glass-panel" aria-labelledby="leaderboard-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Rankings</p>
          <h2 id="leaderboard-title">Leaderboard</h2>
        </div>
        <Trophy aria-hidden="true" className="panel-icon" />
      </div>

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Leaderboard period">
          {periods.map((period) => (
            <button
              key={period}
              type="button"
              className={period === store.leaderboardPeriod ? "is-active" : ""}
              onClick={() => void refreshLeaderboard(period)}
            >
              {period}
            </button>
          ))}
        </div>
        <button type="button" className="icon-button" onClick={() => void refreshLeaderboard(store.leaderboardPeriod)} aria-label="Refresh leaderboard" title="Refresh">
          <RefreshCw aria-hidden="true" />
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={!auth.user || store.status === "publishing"}
          onClick={() => void publishScore(displayName)}
        >
          <Send aria-hidden="true" />
          Publish
        </button>
      </div>

      {!auth.user ? <p className="inline-note">Sign in to publish a score. Public rankings can still be viewed.</p> : null}

      <div className="leaderboard-list">
        {store.leaderboard.length ? (
          store.leaderboard.map((entry, index) => (
            <article key={entry.id} className="leaderboard-row">
              <strong>{index + 1}</strong>
              <div>
                <h3>{entry.display_name}</h3>
                <p>
                  Level {entry.level} · Tier {entry.highest_tier} · {formatNumber(entry.merged_count)} mergers
                </p>
              </div>
              <span>{formatNumber(entry.score)}</span>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <Trophy aria-hidden="true" />
            <p>No rankings posted for this period yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
