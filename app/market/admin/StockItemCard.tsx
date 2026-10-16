/* eslint-disable @next/next/no-img-element */
import { CircleCheck, Pencil, Plus } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { gameLabels, itemTypeOf, prizeTypeLabels } from "../catalog";
import { formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import type { ShopStockItem } from "../types";

export function StockItemCard({
  stockItem,
  withPackAction = false,
}: {
  stockItem: ShopStockItem;
  withPackAction?: boolean;
}) {
  const {
    addCardToDraft,
    draftItems,
    openStockEditor,
    setStockQuantityDrafts,
    showCardDetails,
    stockBusyId,
    stockQuantityDrafts,
    updateStockQuantity,
  } = useMarket();

  const draftQuantity = stockQuantityDrafts[stockItem.id];
  const parsedDraftQuantity = Number(draftQuantity);
  const visibleStockQuantity =
    draftQuantity !== undefined &&
    draftQuantity.trim() !== "" &&
    Number.isFinite(parsedDraftQuantity)
      ? Math.max(0, Math.floor(parsedDraftQuantity))
      : stockItem.quantity;
  const isInDraft = draftItems.some(
    (item) =>
      item.card.id === stockItem.card.id &&
      item.card.game === stockItem.card.game &&
      itemTypeOf(item.card) === itemTypeOf(stockItem.card),
  );

  return (
    <article
      className={`stock-item ${itemTypeOf(stockItem.card)}`}
    >
      <button
        className="stock-image-button"
        onClick={() => showCardDetails(stockItem.card)}
        type="button"
      >
        <img
          src={cardImage(stockItem.card)}
          alt=""
          onError={handleImageError(stockItem.card.game)}
        />
      </button>
      <div className="stock-item-copy">
        <span className={`prize-type-chip ${itemTypeOf(stockItem.card)}`}>
          {prizeTypeLabels[itemTypeOf(stockItem.card)]}
        </span>
        <strong>{stockItem.card.name}</strong>
        <small>
          {formatUsd.format(stockItem.card.priceUsd ?? 0)} -{" "}
          {gameLabels[stockItem.card.game]}
        </small>
        <span>
          {stockItem.card.setName}
          {stockItem.card.number ? ` #${stockItem.card.number}` : ""}
        </span>
      </div>
      <div className="stock-actions">
        <label className="stock-quantity-control">
          <span>Stock</span>
          <input
            aria-label={`Stock de ${stockItem.card.name}`}
            disabled={stockBusyId === stockItem.id}
            inputMode="numeric"
            min="0"
            onBlur={(event) => {
              if (event.currentTarget.value.trim() === "") {
                setStockQuantityDrafts((current) => {
                  const next = { ...current };
                  delete next[stockItem.id];
                  return next;
                });
                return;
              }
              const quantity = Math.max(
                0,
                Math.floor(Number(event.currentTarget.value)),
              );
              if (Number.isFinite(quantity) && quantity !== stockItem.quantity) {
                void updateStockQuantity(stockItem, quantity);
              } else {
                setStockQuantityDrafts((current) => {
                  const next = { ...current };
                  delete next[stockItem.id];
                  return next;
                });
              }
            }}
            onChange={(event) =>
              setStockQuantityDrafts((current) => ({
                ...current,
                [stockItem.id]: event.target.value,
              }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            step="1"
            type="number"
            value={stockQuantityDrafts[stockItem.id] ?? stockItem.quantity}
          />
        </label>
        <div className="stock-stepper-buttons">
          <button
            aria-label={`Restar stock de ${stockItem.card.name}`}
            disabled={stockBusyId === stockItem.id || visibleStockQuantity <= 0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              void updateStockQuantity(stockItem, visibleStockQuantity - 1)
            }
            title="Restar stock"
            type="button"
          >
            -
          </button>
          <button
            aria-label={`Sumar stock de ${stockItem.card.name}`}
            disabled={stockBusyId === stockItem.id}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              void updateStockQuantity(stockItem, visibleStockQuantity + 1)
            }
            title="Sumar stock"
            type="button"
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>
        <button
          aria-label={`Editar ${stockItem.card.name}`}
          className="stock-edit-button"
          disabled={stockBusyId === stockItem.id}
          onClick={() => openStockEditor(stockItem)}
          type="button"
        >
          <Pencil size={15} aria-hidden />
          Editar
        </button>
        {withPackAction && (
          <button
            className={`stock-add-pack${isInDraft ? " in-pack" : ""}`}
            disabled={stockItem.quantity <= 0 || isInDraft}
            onClick={() => addCardToDraft(stockItem.card)}
            type="button"
          >
            {isInDraft ? (
              <>
                <CircleCheck size={16} aria-hidden />
                En la caja
              </>
            ) : (
              <>
                <Plus size={16} aria-hidden />
                A la caja
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
