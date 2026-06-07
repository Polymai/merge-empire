import { Clock, History, Lock, Receipt, Sparkles, ShoppingBag, Zap } from "lucide-react";
import type { GameState } from "../types/game";
import { dispatchGame } from "../state/gameStore";
import { formatNumber } from "../game/economy";
import { emptyCells } from "../game/gameReducer";
import { SHOP_ITEMS } from "../game/shopCatalog";
import { PAID_POWERUPS } from "../game/paidPowerups";

type ShopPanelProps = {
  game: GameState;
  canBuyPowerups: boolean;
  onBuyPowerup: (productId: string) => void;
  onRequireAuth: () => void;
  onOpenPaymentPortal: () => void;
  organizationNumber: string;
  vatPercent: number;
};

function minutesLeft(timestamp: number): number {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 60000));
}

export function ShopPanel({
  game,
  canBuyPowerups,
  onBuyPowerup,
  onRequireAuth,
  onOpenPaymentPortal,
  organizationNumber,
  vatPercent,
}: ShopPanelProps) {
  const openCells = emptyCells(game).length;
  const xpBoostMinutes = minutesLeft(game.boosts.xpMultiplierUntil);
  const autoMinutes = minutesLeft(game.boosts.autoClickerUntil);

  return (
    <section className="glass-panel" aria-labelledby="shop-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Koinshop</p>
          <h2 id="shop-title">Bygg vidare på imperiet</h2>
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
            ? "Avaktiverad"
            : activeTheme
              ? "Aktivt"
              : !enoughSpace
                ? `Behövs ${formatNumber(item.spaceRequired)} tomma celler`
                : !affordable
                  ? `Behöver ${formatNumber(item.price - game.coins)}`
                  : `Köp ${formatNumber(item.price)}`;
          return (
            <article key={item.id} className={unavailable ? "shop-item is-disabled" : "shop-item"}>
              <div>
                <span>{item.kind}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.spaceRequired ? <p className="shop-meta">{item.spaceRequired} tomma celler behövs</p> : null}
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

      <div className="paid-shop">
        <div className="panel-heading paid-shop-heading">
          <div>
            <p className="section-kicker">Betalda powerups</p>
            <h2>Snabbare nivåuppgång</h2>
          </div>
          <Sparkles aria-hidden="true" className="panel-icon" />
        </div>

        <article className="shop-item">
          <div>
            <span>Betalning</span>
            <h3>Stripe-konto</h3>
            <p>Moms i Sverige är inkluderad i alla priser ({vatPercent}%).</p>
            <p className="shop-meta">Org.nr {organizationNumber}</p>
          </div>
          <button type="button" className="secondary-button" onClick={() => (canBuyPowerups ? onOpenPaymentPortal() : onRequireAuth())}>
            {canBuyPowerups ? <Receipt aria-hidden="true" /> : <Lock aria-hidden="true" />}
            {canBuyPowerups ? "Öppna Stripe-konto" : "Logga in först"}
          </button>
        </article>

        <article className="shop-item">
          <div>
            <span>Betalning</span>
            <h3>Tidigare köp</h3>
            <p>Visa kvitton och tidigare köp i Stripe.</p>
            <p className="shop-meta">
              <Clock aria-hidden="true" />
              Öppna snabbt från detta kort
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => (canBuyPowerups ? onOpenPaymentPortal() : onRequireAuth())}
          >
            {canBuyPowerups ? <History aria-hidden="true" /> : <Lock aria-hidden="true" />}
            {canBuyPowerups ? "Visa betalningar" : "Logga in först"}
          </button>
        </article>

        <div className="boost-status">
          <span>{xpBoostMinutes > 0 ? `3x XP ${xpBoostMinutes}m` : "3x XP inaktiv"}</span>
          <span>{autoMinutes > 0 ? `Auto helper ${autoMinutes}m` : "Auto helper inaktiv"}</span>
        </div>

        <div className="shop-grid paid-shop-grid">
          {PAID_POWERUPS.map((powerup) => (
            <article key={powerup.id} className="shop-item paid-shop-item">
              <div>
                <span>{powerup.kind}</span>
                <h3>{powerup.title}</h3>
                <p>{powerup.description}</p>
                <p className="shop-meta">{powerup.priceLabel}</p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => (canBuyPowerups ? onBuyPowerup(powerup.id) : onRequireAuth())}
              >
                {canBuyPowerups ? <Zap aria-hidden="true" /> : <Lock aria-hidden="true" />}
                {canBuyPowerups ? "Öppna checkout" : "Logga in först"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}