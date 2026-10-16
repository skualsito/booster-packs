/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { cardImage, handleImageError } from "../card-display";
import { gameLabels, itemTypeOf, prizeTypeLabels } from "../catalog";
import { formatPercent, formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import { normalizedProbability } from "../pack-math";

export function PackContentsSection() {
  const { selectedPack, showCardDetails } = useMarket();

  return (
    <section className="contents-band" aria-label="Contenidos de la caja">
      <div className="section-heading centered">
        <span className="eyebrow">Contenidos de la caja</span>
        <h2>Todo lo que puede tocar</h2>
      </div>
      <div className="contents-grid">
        {selectedPack.items
          .slice()
          .sort(
            (a, b) =>
              normalizedProbability(a, selectedPack) -
              normalizedProbability(b, selectedPack),
          )
          .map((item) => (
            <button
              className={`content-card ${itemTypeOf(item.card)}`}
              key={item.slotId}
              onClick={() => showCardDetails(item.card)}
              style={{ "--rarity": selectedPack.accent } as CSSProperties}
              type="button"
            >
              <span className="content-prob">
                <small>Probabilidad</small>
                <strong>
                  {formatPercent.format(normalizedProbability(item, selectedPack))}%
                </strong>
              </span>
              <img
                src={cardImage(item.card)}
                alt=""
                onError={handleImageError(item.card.game)}
              />
              <span className="content-game">{gameLabels[item.card.game]}</span>
              <span className={`prize-type-chip ${itemTypeOf(item.card)}`}>
                {prizeTypeLabels[itemTypeOf(item.card)]}
              </span>
              <strong>{item.card.name}</strong>
              <small>{item.card.setName}</small>
              <b>{formatUsd.format(item.card.priceUsd ?? 0)}</b>
            </button>
          ))}
      </div>
    </section>
  );
}
