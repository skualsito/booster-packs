/* eslint-disable @next/next/no-img-element */
import { RotateCcw, Truck, X } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { cardStatusLabels, itemTypeOf, prizeTypeLabels } from "../catalog";
import { formatUsd } from "../format";
import { useMarket } from "../MarketContext";

export function WonCardsModal() {
  const {
    ownedWonCards,
    ownedWonCardsValue,
    sellWonCard,
    setWonCardsOpen,
    showCardDetails,
    withdrawWonCard,
    wonCardBusyId,
    wonCardsOpen,
  } = useMarket();

  if (!wonCardsOpen) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setWonCardsOpen(false);
        }
      }}
      role="presentation"
    >
      <article
        aria-labelledby="won-cards-modal-title"
        aria-modal="true"
        className="utility-modal won-cards-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar premios ganados"
          className="modal-close"
          onClick={() => setWonCardsOpen(false)}
          type="button"
        >
          <X size={18} aria-hidden />
        </button>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Premios ganados</span>
            <h2 id="won-cards-modal-title">
              {formatUsd.format(ownedWonCardsValue)}
            </h2>
          </div>
        </div>
        <div className="won-card-list">
          {ownedWonCards.length ? (
            ownedWonCards.map((cardItem) => (
              <article
                className={`won-card ${itemTypeOf(cardItem.card)}`}
                key={cardItem.id}
              >
                <button
                  className="won-card-image"
                  onClick={() => showCardDetails(cardItem.card)}
                  type="button"
                >
                  <img
                    src={cardImage(cardItem.card)}
                    alt=""
                    onError={handleImageError(cardItem.card.game)}
                  />
                </button>
                <div>
                  <div className="inventory-card-tags">
                    {cardItem.status === "waiting_stock" && (
                      <span className="status-chip waiting_stock">
                        {cardStatusLabels.waiting_stock}
                      </span>
                    )}
                    <span
                      className={`prize-type-chip ${itemTypeOf(cardItem.card)}`}
                    >
                      {prizeTypeLabels[itemTypeOf(cardItem.card)]}
                    </span>
                  </div>
                  <strong>{cardItem.card.name}</strong>
                  <small>
                    {cardItem.packName} -{" "}
                    {formatUsd.format(cardItem.valueUsd)}
                  </small>
                  <span className="card-meta">
                    {cardItem.card.setName}
                    {cardItem.card.number
                      ? ` #${cardItem.card.number}`
                      : ""}
                  </span>
                </div>
                <div className="won-card-actions">
                  <button
                    className="sell-action"
                    disabled={wonCardBusyId === cardItem.id}
                    onClick={() => void sellWonCard(cardItem.id)}
                    type="button"
                  >
                    Vender
                  </button>
                  <button
                    className={
                      cardItem.status === "waiting_stock"
                        ? "retry-action"
                        : "withdraw-action"
                    }
                    disabled={wonCardBusyId === cardItem.id}
                    onClick={() => void withdrawWonCard(cardItem.id)}
                    type="button"
                  >
                    {cardItem.status === "waiting_stock" ? (
                      <RotateCcw size={16} aria-hidden />
                    ) : (
                      <Truck size={16} aria-hidden />
                    )}
                    {cardItem.status === "waiting_stock"
                      ? "Reintentar retiro"
                      : "Retirar"}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-list">
              No tenes premios disponibles para vender o retirar. El
              historial completo queda en tu perfil.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
