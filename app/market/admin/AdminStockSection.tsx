/* eslint-disable @next/next/no-img-element */
import type { CardGame, PrizeItemType } from "../../lib/card-search";
import { Boxes, Plus, RotateCcw, Search } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import {
  cardGames,
  gameLabels,
  isSellerRole,
  itemTypeOf,
  prizeTypeLabels,
} from "../catalog";
import { SearchConsole } from "../components/SearchConsole";
import { formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import {
  AdminShellHeader,
  SellerRequiredPanel,
  StockFilterControls,
} from "./AdminShell";
import { StockItemCard } from "./StockItemCard";

export function AdminStockSection() {
  const {
    addCardToStock,
    addSealedProductToStock,
    adminSearch,
    filteredShopStock,
    loadShopStock,
    manualSealedOpen,
    runSearch,
    sealedGame,
    sealedImageUrl,
    sealedName,
    sealedPrice,
    sealedQuantity,
    sealedQuery,
    sealedResults,
    sealedSearchError,
    sealedSearchLoading,
    sealedSetName,
    sealedType,
    searchSealedProducts,
    selectSealedSearchResult,
    session,
    setAdminSearch,
    setManualSealedOpen,
    setSealedGame,
    setSealedImageUrl,
    setSealedName,
    setSealedPrice,
    setSealedQuantity,
    setSealedQuery,
    setSealedResults,
    setSealedSearchError,
    setSealedSetName,
    setSealedType,
    stockMessage,
  } = useMarket();

  return (
    <section className="admin-band page-section" aria-label="Stock de Pullario">
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="stock-page-grid">
          <div className="stock-entry-column">
            <SearchConsole
              actionLabel="Stock"
              onCardAction={(card) => void addCardToStock(card)}
              onSearch={(override) => runSearch("admin", override)}
              search={adminSearch}
              setSearch={setAdminSearch}
            />
            <div className="sealed-stock-form">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Producto sellado</span>
                  <h2>Buscar sobre o caja</h2>
                </div>
                <Boxes size={22} aria-hidden />
              </div>

              <div className="sealed-search-bar">
                <label>
                  Juego
                  <select
                    onChange={(event) => {
                      setSealedGame(event.target.value as CardGame)
                      setSealedQuery("");
                      setSealedResults([]);
                      setSealedSearchError("");
                    }}
                    value={sealedGame}
                  >
                    {cardGames.map((game) => (
                      <option key={game} value={game}>
                        {gameLabels[game]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Expansion o producto
                  <input
                    onChange={(event) => setSealedQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void searchSealedProducts();
                      }
                    }}
                    placeholder="Ej: Surging Sparks booster box"
                    value={sealedQuery}
                  />
                </label>
                <button
                  className="primary-action compact"
                  disabled={sealedSearchLoading || sealedQuery.trim().length < 2}
                  onClick={() => void searchSealedProducts()}
                  type="button"
                >
                  <Search size={17} aria-hidden />
                  {sealedSearchLoading ? "Buscando" : "Buscar"}
                </button>
              </div>
              {sealedSearchLoading && (
                <div className="sealed-search-loading" role="status">
                  <span aria-hidden />
                  Buscando productos y precios
                </div>
              )}
              {sealedSearchError && (
                <p className="admin-message">{sealedSearchError}</p>
              )}
              {sealedResults.length > 0 && (
                <div className="sealed-search-results">
                  {sealedResults.map((product) => (
                    <article key={product.id}>
                      <img
                        src={cardImage(product)}
                        alt=""
                        onError={handleImageError(product.game, itemTypeOf(product))}
                      />
                      <div className="sealed-result-copy">
                        <span className={`prize-type-chip ${itemTypeOf(product)}`}>
                          {prizeTypeLabels[itemTypeOf(product)]}
                        </span>
                        <strong>{product.name}</strong>
                        <small>{product.setName}</small>
                      </div>
                      <div className="sealed-result-actions">
                        <b>
                          {typeof product.priceUsd === "number"
                            ? formatUsd.format(product.priceUsd)
                            : "Sin precio"}
                        </b>
                        <button
                          aria-label={`Agregar ${product.name}`}
                          onClick={() => void selectSealedSearchResult(product)}
                          type="button"
                        >
                          <Plus size={17} aria-hidden />
                          {typeof product.priceUsd === "number"
                            ? "Al stock"
                            : "Completar"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <details
                className="manual-sealed-entry"
                onToggle={(event) =>
                  setManualSealedOpen(event.currentTarget.open)
                }
                open={manualSealedOpen}
              >
                <summary>Cargar manualmente</summary>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void addSealedProductToStock();
                  }}
                >
                  <div className="sealed-form-grid">
                    <label>
                      Tipo
                      <select
                        onChange={(event) =>
                          setSealedType(
                            event.target.value as Exclude<PrizeItemType, "card">,
                          )
                        }
                        value={sealedType}
                      >
                        <option value="sealed-pack">Sobre sellado</option>
                        <option value="sealed-box">Caja sellada</option>
                      </select>
                    </label>
                    <label>
                      Juego
                      <select
                        onChange={(event) =>
                          setSealedGame(event.target.value as CardGame)
                        }
                        value={sealedGame}
                      >
                        {cardGames.map((game) => (
                          <option key={game} value={game}>
                            {gameLabels[game]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="wide">
                      Nombre
                      <input
                        onChange={(event) => setSealedName(event.target.value)}
                        placeholder="Ej: OP-13 Booster Pack"
                        value={sealedName}
                      />
                    </label>
                    <label className="wide">
                      Expansion
                      <input
                        onChange={(event) => setSealedSetName(event.target.value)}
                        placeholder="Ej: OP-13 Carrying On His Will"
                        value={sealedSetName}
                      />
                    </label>
                    <label>
                      Precio USD
                      <input
                        min="0.01"
                        onChange={(event) =>
                          setSealedPrice(Number(event.target.value))
                        }
                        step="0.01"
                        type="number"
                        value={sealedPrice}
                      />
                    </label>
                    <label>
                      Cantidad
                      <input
                        min="1"
                        onChange={(event) =>
                          setSealedQuantity(Number(event.target.value))
                        }
                        step="1"
                        type="number"
                        value={sealedQuantity}
                      />
                    </label>
                    <label className="wide">
                      URL de imagen
                      <input
                        onChange={(event) => setSealedImageUrl(event.target.value)}
                        placeholder="https://..."
                        type="url"
                        value={sealedImageUrl}
                      />
                    </label>
                  </div>
                  <button className="primary-action compact" type="submit">
                    <Plus size={17} aria-hidden />
                    Agregar al stock
                  </button>
                </form>
              </details>
            </div>
          </div>
          <div className="stock-panel standalone">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Stock de Pullario</span>
                <h2>{filteredShopStock.length} productos</h2>
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
            <StockFilterControls />
            {stockMessage && <p className="admin-message">{stockMessage}</p>}
            <div className="stock-list expanded">
              {filteredShopStock.length ? (
                filteredShopStock.map((stockItem) => (
                  <StockItemCard key={stockItem.id} stockItem={stockItem} />
                ))
              ) : (
                <p>
                  No hay productos en este filtro. Busca una carta o carga un
                  producto sellado.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );
}
