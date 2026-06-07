import { Lock, ShoppingBag } from "lucide-react";
import type { GameState } from "../types/game";
import { dispatchGame } from "../state/gameStore";
import { formatNumber } from "../game/economy";
import { emptyCells } from "../game/gameReducer";
import { SHOP_ITEMS } from "../game/shopCatalog";

type ShopPanelProps = {
  game: GameState;
};

export function ShopPanel({ game }: ShopPanelProps) {
  const openCells = emptyCells(game).length;

  return (
    <section className="glass-panel" aria-labelledby="shop-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Coin shop</p>
          <h2 id="shop-title">Boost the empire</h2>
        </div>
        <ShoppingBag aria-hidden="true" className="panel-icon" />
      </div>

      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => {
          const affordable = game.coins >= item.price;
          const enoughSpace = !item.spaceRequired || openCells >= item.spaceRequired;
          const activeTheme =
            (item.id === "mint-theme" && game.activeTheme === "mint") || (item.id === "gold-theme" && game.activeTheme === "gold");
          const unavailable = item.disabled || !affordable || !enoughSpace || activeTheme;
          const buttonLabel = item.disabled
            ? "Reserved"
            : activeTheme
              ? "Active"
            : !enoughSpace
              ? "Need space"
              : !affordable
                ? `Need ${formatNumber(item.price - game.coins)}`
                : `Buy ${formatNumber(item.price)}`;
          return (
            <article key={item.id} className={unavailable ? "shop-item is-disabled" : "shop-item"}>
              <div>
                <span>{item.kind}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.spaceRequired ? <p className="shop-meta">{item.spaceRequired} empty cells needed</p> : null}
              </div>
              <button
                type="button"
                className="secondary-button"
                disabled={unavailable}
                onClick={() => dispatchGame({ type: "buyShopItem", itemId: item.id })}
              >
                {item.disabled ? <Lock aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />}
                {buttonLabel}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
