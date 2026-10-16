/* eslint-disable @next/next/no-img-element */
import {
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  X,
} from "../../MaterialIcons";
import { cardImage } from "../card-display";
import {
  cardGames,
  gameLabels,
  isSellerRole,
  itemTypeOf,
  prizeItemTypes,
  prizeTypeLabels,
  prizeTypeShortLabels,
} from "../catalog";
import { SortControl } from "../components/SortControl";
import { formatPercent, formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import { normalizeItems } from "../pack-math";
import type { PackGame } from "../types";
import { AdminShellHeader, SellerRequiredPanel } from "./AdminShell";
import { StockItemCard } from "./StockItemCard";

export function AdminPacksSection() {
  const {
    adminSaving,
    deleteSavedPack,
    draftExpectedValue,
    draftGame,
    draftItems,
    draftMargin,
    draftName,
    draftPrice,
    draftPriceSort,
    draftProbabilityTotal,
    draftSeries,
    editingPackId,
    loadShopStock,
    packBuilderStock,
    packPrizeFilter,
    packStockGameFilter,
    removeDraftItem,
    resetDraftPack,
    saveDraftPack,
    sellerPacks,
    session,
    setDraftGame,
    setDraftItems,
    setDraftName,
    setDraftPrice,
    setDraftPriceSort,
    setDraftSeries,
    setPackPrizeFilter,
    setPackStockGameFilter,
    sortedDraftItems,
    startEditingPack,
    stockQuantityForCard,
    updateDraftProbability,
  } = useMarket();

  return (
    <section className="admin-band page-section" aria-label="Crear cajas">
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <>
          <div className="admin-grid packs-grid">
            <div className="admin-form">
              <div className={`pack-editor-heading${editingPackId ? " editing" : ""}`}>
                <div className="pack-editor-icon" aria-hidden>
                  {editingPackId ? <Pencil size={19} /> : <Plus size={19} />}
                </div>
                <div>
                  <span>{editingPackId ? "Editando caja" : "Nueva caja"}</span>
                  <strong>
                    {editingPackId ? draftName || "Sin nombre" : "Configura sus datos"}
                  </strong>
                </div>
                {editingPackId && (
                  <button
                    aria-label="Cancelar edicion"
                    onClick={resetDraftPack}
                    title="Cancelar edicion"
                    type="button"
                  >
                    <X size={17} aria-hidden />
                  </button>
                )}
              </div>
              <label>
                Nombre de la caja
                <input
                  onChange={(event) => setDraftName(event.target.value)}
                  value={draftName}
                />
              </label>
              <label>
                Serie
                <input
                  onChange={(event) => setDraftSeries(event.target.value)}
                  value={draftSeries}
                />
              </label>
              <label>
                Juego
                <select
                  onChange={(event) => setDraftGame(event.target.value as PackGame)}
                  value={draftGame}
                >
                  <option value="mixed">Mixto</option>
                  <option value="one-piece">One Piece</option>
                  <option value="pokemon">Pokemon</option>
                  <option value="magic">Magic</option>
                </select>
              </label>
              <label>
                Precio USD
                <input
                  min="0"
                  onChange={(event) => setDraftPrice(Number(event.target.value))}
                  step="0.01"
                  type="number"
                  value={draftPrice}
                />
              </label>

              <div className="admin-metrics">
                <span>
                  <small>Premios</small>
                  <strong>{draftItems.length}</strong>
                </span>
                <span>
                  <small>Prob.</small>
                  <strong>{formatPercent.format(draftProbabilityTotal)}%</strong>
                </span>
                <span>
                  <small>EV</small>
                  <strong>{formatUsd.format(draftExpectedValue)}</strong>
                </span>
                <span className={draftMargin < 0 ? "negative" : ""}>
                  <small>Margen</small>
                  <strong>{formatUsd.format(draftMargin)}</strong>
                </span>
              </div>

              <div className="admin-actions">
                <button
                  className="secondary-action compact"
                  disabled={adminSaving}
                  onClick={resetDraftPack}
                  type="button"
                >
                  <Plus size={17} aria-hidden />
                  Nueva caja
                </button>
                <button
                  className="secondary-action compact"
                  disabled={!draftItems.length || adminSaving}
                  onClick={() =>
                    setDraftItems((current) => normalizeItems(current, draftPrice))
                  }
                  type="button"
                >
                  <RotateCcw size={17} aria-hidden />
                  Normalizar rentable
                </button>
                <button
                  className="primary-action compact"
                  disabled={!draftItems.length || !draftName.trim() || adminSaving}
                  onClick={() => void saveDraftPack()}
                  type="button"
                >
                  <Save size={17} aria-hidden />
                  {adminSaving
                    ? "Guardando"
                    : editingPackId
                      ? "Actualizar caja"
                      : "Guardar caja"}
                </button>
              </div>
            </div>

            <div className="stock-panel pack-source-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Premios disponibles</span>
                  <h2>{packBuilderStock.length} en stock</h2>
                </div>
                <button
                  className="secondary-action compact"
                  onClick={() => void loadShopStock()}
                  type="button"
                >
                  <RotateCcw size={16} aria-hidden />
                  Refrescar
                </button>
              </div>
              <div className="stock-type-tabs" aria-label="Filtro para armar caja">
                <button
                  className={packStockGameFilter === "mixed" ? "active" : ""}
                  onClick={() => setPackStockGameFilter("mixed")}
                  type="button"
                >
                  Todos
                </button>
                {cardGames.map((game) => (
                  <button
                    className={packStockGameFilter === game ? "active" : ""}
                    key={game}
                    onClick={() => setPackStockGameFilter(game)}
                    type="button"
                  >
                    {gameLabels[game]}
                  </button>
                ))}
              </div>
              <div className="stock-type-tabs" aria-label="Tipo de premio para armar caja">
                <button
                  className={packPrizeFilter === "all" ? "active" : ""}
                  onClick={() => setPackPrizeFilter("all")}
                  type="button"
                >
                  Todo tipo
                </button>
                {prizeItemTypes.map((itemType) => (
                  <button
                    className={packPrizeFilter === itemType ? "active" : ""}
                    key={itemType}
                    onClick={() => setPackPrizeFilter(itemType)}
                    type="button"
                  >
                    {prizeTypeShortLabels[itemType]}
                  </button>
                ))}
              </div>
              <div className="stock-list expanded">
                {packBuilderStock.length ? (
                  packBuilderStock.map((stockItem) => (
                    <StockItemCard
                      key={stockItem.id}
                      stockItem={stockItem}
                      withPackAction
                    />
                  ))
                ) : (
                  <p>
                    No hay stock compatible con esta caja. Cargalo desde la
                    pagina de stock.
                  </p>
                )}
              </div>
            </div>

            <div className="draft-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Premios de la caja</span>
                  <h2>{draftItems.length} items</h2>
                </div>
                <SortControl
                  ariaLabel="Ordenar premios por precio"
                  onChange={(value) =>
                    setDraftPriceSort(value as "price-desc" | "price-asc")
                  }
                  options={[
                    { value: "price-desc", label: "Mayor a menor" },
                    { value: "price-asc", label: "Menor a mayor" },
                  ]}
                  value={draftPriceSort}
                />
              </div>
              <div className="draft-list">
                {draftItems.length ? (
                  sortedDraftItems.map((item) => (
                    <div
                      className={`draft-item ${itemTypeOf(item.card)}`}
                      key={item.slotId}
                    >
                      <img src={cardImage(item.card)} alt="" />
                      <div>
                        <span className={`prize-type-chip ${itemTypeOf(item.card)}`}>
                          {prizeTypeLabels[itemTypeOf(item.card)]}
                        </span>
                        <strong>{item.card.name}</strong>
                        <small>
                          {formatUsd.format(item.card.priceUsd ?? 0)} -{" "}
                          {gameLabels[item.card.game]}
                        </small>
                        <small>Stock disponible {stockQuantityForCard(item.card)}</small>
                        <label>
                          Prob. %
                          <input
                            min="0"
                            onChange={(event) =>
                              updateDraftProbability(
                                item.slotId,
                                Number(event.target.value),
                              )
                            }
                            step="0.001"
                            type="number"
                            value={item.probability}
                          />
                        </label>
                      </div>
                      <button
                        aria-label={`Quitar ${item.card.name}`}
                        onClick={() => removeDraftItem(item.slotId)}
                        title="Quitar"
                        type="button"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Agrega premios desde tu stock para armar la caja.</p>
                )}
              </div>
            </div>
          </div>

          <div className="saved-packs">
            <h3>Cajas creadas</h3>
            {sellerPacks.length ? (
              sellerPacks.map((pack) => (
                <div className="saved-pack" key={pack.id}>
                  <span>
                    <strong>{pack.name}</strong>
                    <small>
                      Pullario - {pack.series} -{" "}
                      {pack.items.length} premios
                    </small>
                  </span>
                  <div className="saved-pack-actions">
                    <button
                      disabled={adminSaving}
                      onClick={() => startEditingPack(pack)}
                      type="button"
                    >
                      <Settings size={16} aria-hidden />
                      Editar
                    </button>
                    <button
                      disabled={adminSaving}
                      onClick={() => void deleteSavedPack(pack.id)}
                      type="button"
                    >
                      <Trash2 size={16} aria-hidden />
                      Borrar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay cajas creadas todavia.</p>
            )}
          </div>
        </>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );
}
