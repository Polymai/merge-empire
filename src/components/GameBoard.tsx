import { Coins, Download, HandCoins, RotateCcw, ShoppingBag, Zap } from "lucide-react";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { GameState } from "../types/game";
import { dispatchGame, resetGuestGame } from "../state/gameStore";
import { emptyCells } from "../game/gameReducer";
import { formatNumber, incomeForItems, spawnCost, todayKey } from "../game/economy";
import { getTier } from "../game/itemTiers";
import { useDragMerge } from "../hooks/useDragMerge";
import { playClick, playMerge, playReward } from "../audio/audioEngine";
import { LottieIcon } from "./LottieIcon";

type GameBoardProps = {
  game: GameState;
  muted: boolean;
  onSaveCloud: () => void;
  canSaveCloud: boolean;
};

const cellShapeClasses = ["cell-bubble", "cell-circle", "cell-pill", "cell-drop", "cell-cloud", "cell-gem"];

export function GameBoard({ game, muted, onSaveCloud, canSaveCloud }: GameBoardProps) {
  const [mergeCell, setMergeCell] = useState<number | null>(null);
  const mergeTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const now = Date.now();
  const readyIncome = incomeForItems(game.items, now, now < game.boosts.incomeMultiplierUntil ? 2 : 1);
  const cost = spawnCost(game);
  const openCells = emptyCells(game).length;
  const canSpawn = openCells > 0 && game.coins >= cost;
  const canClaimDaily = game.lastDailyClaim !== todayKey();
  const cellCount = game.boardSize * game.boardSize;
  const buyHint =
    openCells === 0
      ? "Board full. Merge matching icons to make room."
      : game.coins < cost
        ? `Need ${formatNumber(cost - game.coins)} more coins for the next icon.`
        : `Next icon costs ${formatNumber(cost)} coins.`;

  const drag = useDragMerge({
    state: game,
    onMove: (itemId, toCell) => {
      playClick(muted);
      dispatchGame({ type: "move", itemId, toCell });
    },
    onMerge: (sourceId, targetId) => {
      const target = game.items.find((item) => item.id === targetId);
      if (target) {
        setMergeCell(target.cell);
        if (mergeTimer.current) window.clearTimeout(mergeTimer.current);
        mergeTimer.current = window.setTimeout(() => setMergeCell(null), 700);
      }
      playMerge(muted);
      dispatchGame({ type: "merge", sourceId, targetId });
    },
  });

  function tileStyle(tier: number, ghost = false): CSSProperties {
    const tierGrowth = Math.min(28, Math.max(0, tier - 1) * 2.15);
    return {
      "--tile-size": `${Math.min(98, 70 + tierGrowth)}%`,
      "--icon-size": `${Math.min(112, 92 + tierGrowth * 0.6)}%`,
      "--ghost-size": `${Math.min(88, 58 + tierGrowth)}px`,
      ...(ghost && drag.dragGhost ? { left: drag.dragGhost.x, top: drag.dragGhost.y } : {}),
    } as CSSProperties;
  }

  function handleSpawn() {
    if (!canSpawn) return;
    playClick(muted);
    dispatchGame({ type: "spawn" });
  }

  function handleIncome() {
    if (readyIncome <= 0) return;
    playReward(muted);
    dispatchGame({ type: "collectIncome" });
  }

  function handleDaily() {
    if (!canClaimDaily) return;
    playReward(muted);
    dispatchGame({ type: "claimDaily" });
  }

  return (
    <section className={`board-panel board-theme-${game.activeTheme}`} aria-labelledby="board-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Operating board</p>
          <h2 id="board-title">Merge icons</h2>
        </div>
        <div className="level-badge">Level {game.level}</div>
      </div>

      <div className="stat-strip" aria-label="Game totals">
        <div>
          <span>Coins</span>
          <strong>{formatNumber(game.coins)}</strong>
        </div>
        <div>
          <span>XP</span>
          <strong>{formatNumber(game.xp)}</strong>
        </div>
        <div>
          <span>Board</span>
          <strong>
            {game.boardSize}x{game.boardSize}
          </strong>
        </div>
      </div>

      <div
        className="merge-board"
        data-merge-board="true"
        data-board-size={game.boardSize}
        style={{ "--board-size": game.boardSize } as CSSProperties}
        aria-label="Merge board"
      >
        {Array.from({ length: cellCount }, (_, cell) => {
          const item = game.items.find((entry) => entry.cell === cell);
          const tier = item ? getTier(item.tier) : null;
          const isDropTarget = drag.hoverCell === cell && drag.draggingId !== item?.id;
          const isMergeCell = mergeCell === cell;
          return (
            <button
              type="button"
              key={cell}
              className={[
                "board-cell",
                cellShapeClasses[cell % cellShapeClasses.length],
                item ? "has-item" : "",
                isDropTarget ? "is-drop-target" : "",
                isMergeCell ? "is-merge-cell" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={item ? `${tier?.name}, tier ${item.tier}` : `Empty cell ${cell + 1}`}
              {...drag.cellProps(cell)}
            >
              {item && tier ? (
                <span
                  key={`${item.id}-${item.tier}`}
                  className={[
                    "venture-tile bg-gradient-to-br",
                    tier.palette,
                    `shape-${tier.shape}`,
                    drag.selectedId === item.id ? "is-selected" : "",
                    drag.draggingId === item.id && drag.dragGhost ? "is-dragging-source" : "",
                    isMergeCell ? "is-merging" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={tileStyle(item.tier)}
                  {...drag.itemProps(item)}
                >
                  <LottieIcon kind={tier.lottie} className="venture-lottie" />
                  <span className="venture-tier">T{item.tier}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {drag.dragGhost ? (
        <span
          className={`venture-tile venture-drag-ghost bg-gradient-to-br ${getTier(drag.dragGhost.item.tier).palette} shape-${getTier(drag.dragGhost.item.tier).shape}`}
          style={tileStyle(drag.dragGhost.item.tier, true)}
          aria-hidden="true"
        >
          <LottieIcon kind={getTier(drag.dragGhost.item.tier).lottie} className="venture-lottie" />
          <span className="venture-tier">T{drag.dragGhost.item.tier}</span>
        </span>
      ) : null}

      <div className="action-grid">
        <button type="button" className="primary-button" onClick={handleSpawn} disabled={!canSpawn}>
          <ShoppingBag aria-hidden="true" />
          Buy icon {formatNumber(cost)}
        </button>
        <button type="button" className="secondary-button" onClick={handleIncome} disabled={readyIncome <= 0}>
          <HandCoins aria-hidden="true" />
          Collect {formatNumber(readyIncome)}
        </button>
        <button type="button" className="secondary-button" onClick={handleDaily} disabled={!canClaimDaily}>
          <Coins aria-hidden="true" />
          Daily
        </button>
        <button type="button" className="secondary-button" onClick={onSaveCloud} disabled={!canSaveCloud}>
          <Download aria-hidden="true" />
          Sync
        </button>
      </div>
      <p className={canSpawn ? "buy-hint" : "buy-hint is-warning"}>{buyHint}</p>

      <div className="board-footer">
        <div className="tiny-status">
          <Zap aria-hidden="true" />
          Pair matching icon tiers, then drop or tap to merge.
        </div>
        <button type="button" className="text-button" onClick={resetGuestGame}>
          <RotateCcw aria-hidden="true" />
          Reset guest board
        </button>
      </div>
    </section>
  );
}
