/* eslint-disable @next/next/no-img-element */
import { Save, X } from "../../MaterialIcons";
import { cardImage, handleImageError, localImageUrl } from "../card-display";
import { gameLabels, itemTypeOf } from "../catalog";
import { useMarket } from "../MarketContext";

export function StockEditModal() {
  const {
    saveStockDetails,
    setStockEditImageUrl,
    setStockEditor,
    setStockEditPrice,
    stockEditError,
    stockEditImageUrl,
    stockEditor,
    stockEditPrice,
    stockEditSaving,
  } = useMarket();

  if (!stockEditor) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !stockEditSaving) {
          setStockEditor(null);
        }
      }}
      role="presentation"
    >
      <article
        aria-labelledby="stock-edit-modal-title"
        aria-modal="true"
        className="utility-modal stock-edit-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar edicion de stock"
          className="modal-close"
          disabled={stockEditSaving}
          onClick={() => setStockEditor(null)}
          type="button"
        >
          <X size={18} aria-hidden />
        </button>
        <span className="eyebrow">Editar producto</span>
        <div className="stock-edit-heading">
          <img
            alt=""
            onError={handleImageError(
              stockEditor.card.game,
              itemTypeOf(stockEditor.card),
            )}
            src={
              stockEditImageUrl.trim()
                ? localImageUrl(stockEditImageUrl.trim())
                : cardImage({ ...stockEditor.card, imageUrl: undefined })
            }
          />
          <div>
            <h2 id="stock-edit-modal-title">{stockEditor.card.name}</h2>
            <p>
              {gameLabels[stockEditor.card.game]} - Stock actual: {stockEditor.quantity}
            </p>
          </div>
        </div>
        <label>
          Precio USD
          <input
            autoFocus
            inputMode="decimal"
            onChange={(event) => setStockEditPrice(event.target.value)}
            placeholder="Ej: 12.50"
            type="text"
            value={stockEditPrice}
          />
        </label>
        <label>
          URL de la imagen
          <input
            onChange={(event) => setStockEditImageUrl(event.target.value)}
            placeholder="https://..."
            type="url"
            value={stockEditImageUrl}
          />
        </label>
        <p className="stock-edit-help">
          Podes usar una imagen directa en formato JPG, PNG o WebP.
        </p>
        {stockEditError && (
          <p className="search-error" role="alert">
            {stockEditError}
          </p>
        )}
        <div className="stock-edit-actions">
          <button
            className="secondary-action compact"
            disabled={stockEditSaving}
            onClick={() => setStockEditor(null)}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="primary-action compact"
            disabled={stockEditSaving || stockEditPrice.trim() === ""}
            onClick={() => void saveStockDetails()}
            type="button"
          >
            <Save size={16} aria-hidden />
            {stockEditSaving ? "Guardando" : "Guardar cambios"}
          </button>
        </div>
      </article>
    </div>
  );
}
