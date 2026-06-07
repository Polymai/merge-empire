import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import type { GameState } from "../types/game";
import { formatNumber } from "../game/economy";

type HeroPanelProps = {
  game: GameState;
  onPrimary: () => void;
  onLeaderboard: () => void;
};

export function HeroPanel({ game, onPrimary, onLeaderboard }: HeroPanelProps) {
  return (
    <section className="hero-copy" aria-labelledby="hero-title">
      <div className="eyebrow">
        <Sparkles aria-hidden="true" />
        Soft cloud icon merge game
      </div>
      <h1 id="hero-title">Merge Empire</h1>
      <p className="hero-lede">
        Combine tiny smiles into bigger icons, bank idle revenue, clear missions, and publish your best empire run.
      </p>
      <div className="hero-actions">
        <button type="button" className="primary-button" onClick={onPrimary}>
          Play the board
          <ArrowRight aria-hidden="true" />
        </button>
        <button type="button" className="ghost-button" onClick={onLeaderboard}>
          <Trophy aria-hidden="true" />
          Rankings
        </button>
      </div>
      <dl className="hero-metrics">
        <div>
          <dt>Net worth</dt>
          <dd>{formatNumber(game.netWorth)}</dd>
        </div>
        <div>
          <dt>Highest icon</dt>
          <dd>{game.highestTier}</dd>
        </div>
        <div>
          <dt>Mergers</dt>
          <dd>{formatNumber(game.merges)}</dd>
        </div>
      </dl>
    </section>
  );
}
