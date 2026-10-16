/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { CardGame, PrizeItemType } from "./lib/card-search";
import { AdminDashboardSection } from "./market/admin/AdminDashboardSection";
import { AdminPacksSection } from "./market/admin/AdminPacksSection";
import {
  AdminShellHeader,
  SellerRequiredPanel,
  StockFilterControls,
} from "./market/admin/AdminShell";
import { StockItemCard } from "./market/admin/StockItemCard";
import { AuthModal } from "./market/auth/AuthPanel";
import {
  cardImage,
  handleImageError,
  localImageUrl,
} from "./market/card-display";
import {
  CardsSearchSection,
  SelectedCardModal,
} from "./market/cards/CardsSearchSection";
import {
  cardGames,
  cardStatusLabels,
  gameLabels,
  isSellerRole,
  itemTypeOf,
  orderStatusLabels,
  prizeTypeLabels,
} from "./market/catalog";
import { ChangerSection } from "./market/changer/ChangerSection";
import { SearchConsole } from "./market/components/SearchConsole";
import { SortControl } from "./market/components/SortControl";
import {
  HIT_CELEBRATION_PIECES,
  HIT_PROBABILITY_THRESHOLD,
} from "./market/constants";
import { formatCardDate, formatPercent, formatUsd } from "./market/format";
import { HomeView } from "./market/home/HomeSections";
import { AppHeader } from "./market/layout/AppHeader";
import { NoticeToast } from "./market/layout/NoticeToast";
import { SiteFooter } from "./market/layout/SiteFooter";
import { MarketContext } from "./market/MarketContext";
import { normalizedProbability } from "./market/pack-math";
import { ProfileSection } from "./market/profile/ProfileSection";
import { WalletModal } from "./market/profile/WalletModal";
import { WonCardsModal } from "./market/profile/WonCardsModal";
import type { AppView } from "./market/types";
import { UpgraderSection } from "./market/upgrader/UpgraderSection";
import { useMarketState } from "./market/useMarketState";
import {
  ArrowLeft,
  Boxes,
  CircleCheck,
  Dice5,
  Eye,
  Home,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Trophy,
  Truck,
  User,
  X,
} from "./MaterialIcons";

export function BoosterMarket({
  initialPackId,
  view = "home",
}: {
  initialPackId?: string;
  view?: AppView;
}) {
  const market = useMarketState({ initialPackId, view });
  const {
    activeShipmentGroups,
    addCardToStock,
    addSealedProductToStock,
    adminInventoryActiveOnly,
    adminInventoryMaxPrice,
    adminInventoryMinPrice,
    adminInventorySort,
    adminSearch,
    adminUserQuery,
    adminUsers,
    adminUsersLoading,
    adminUsersMessage,
    adminUserView,
    adminUserWithdrawalGroups,
    apiStatus,
    authMessage,
    celebratingRunId,
    filteredShopStock,
    groupedShopOrders,
    idleRouletteItems,
    loadAdminUserCards,
    loadAdminUsers,
    loadDbPacks,
    loadShopOrders,
    loadShopShipments,
    loadShopStock,
    manualSealedOpen,
    markSelectedOrdersShipped,
    markShipmentReceived,
    openingPack,
    openPack,
    ordersMessage,
    recentDrops,
    recentDropsLoading,
    rouletteTrackRef,
    runSearch,
    saveStockDetails,
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
    selectedAdminUser,
    selectedPack,
    selectedPackExists,
    selectedShipmentIds,
    selectedShipmentsReady,
    selectedShipmentUserId,
    selectedTopItem,
    selectSealedSearchResult,
    session,
    setAdminInventoryActiveOnly,
    setAdminInventoryMaxPrice,
    setAdminInventoryMinPrice,
    setAdminInventorySort,
    setAdminSearch,
    setAdminUserQuery,
    setAdminUserView,
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
    setSelectedShipmentIds,
    setShipmentTrackingNumber,
    setShipmentView,
    setShippingModalOpen,
    setStockEditImageUrl,
    setStockEditor,
    setStockEditPrice,
    shipmentBusyKey,
    shipmentHistoryGroups,
    shipmentsMessage,
    shipmentTrackingNumber,
    shipmentView,
    shippingModalOpen,
    shippingOrders,
    showCardDetails,
    stockEditError,
    stockEditImageUrl,
    stockEditor,
    stockEditPrice,
    stockEditSaving,
    stockMessage,
    toggleShipmentSelection,
    visibleAdminUserCards,
    visibleRouletteItems,
    visibleRouletteOffset,
    visibleRoulettePhase,
    visibleRouletteResult,
    visibleRouletteRunId,
    withdrawnOrderCount,
  } = market;

  const openingSection = (
    <section className="case-layout" aria-label="Abrir caja">
      <div className="page-heading">
        <Link className="secondary-action compact" href="/">
          <ArrowLeft size={17} aria-hidden />
          Cajas
        </Link>
        <div>
          <span className="eyebrow">Caja activa</span>
          <h1>{selectedPack.name}</h1>
          <p>
            {selectedPack.series}
          </p>
        </div>
      </div>

      <div className="opening-stage">
        <div className="stage-main">
          {celebratingRunId === visibleRouletteRunId &&
            visibleRouletteResult && (
              <div className="hit-celebration" role="status">
                <span className="sr-only">Conseguiste un premio destacado.</span>
                {HIT_CELEBRATION_PIECES.map((piece, index) => (
                  <i
                    aria-hidden
                    key={`${visibleRouletteRunId}-celebration-${index}`}
                    style={
                      {
                        "--piece-color": piece.color,
                        "--piece-delay": piece.delay,
                        "--piece-left": piece.left,
                        "--piece-rotation": piece.rotation,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            )}
          <div className="stage-top">
            <div>
              <span className="eyebrow">Ruleta</span>
              <p>Todos los premios posibles participan en cada apertura.</p>
            </div>
            <div className="stage-price">
              <small>Precio</small>
              <strong>{formatUsd.format(selectedPack.price)}</strong>
            </div>
          </div>

          <div className="roulette-window">
            <div className="safe-zone" aria-hidden />
            <div className="center-marker" aria-hidden />
            {visibleRouletteItems.length ? (
              <div
                className="roulette-track"
                data-roulette-run={visibleRouletteRunId}
                key={visibleRouletteRunId}
                ref={rouletteTrackRef}
                style={
                  {
                    transform: `translateX(-${visibleRouletteOffset}px)`,
                    "--spin-duration":
                      visibleRoulettePhase === "spinning" ? "3600ms" : "0ms",
                  } as CSSProperties
                }
              >
                {visibleRouletteItems.map((item) => (
                  <div
                    className={`roulette-item ${itemTypeOf(item.card)}`}
                    key={item.spinKey}
                    style={{ "--rarity": selectedPack.accent } as CSSProperties}
                  >
                    <img src={cardImage(item.card)} alt="" />
                    <small>{prizeTypeLabels[itemTypeOf(item.card)]}</small>
                    <span>{item.card.name}</span>
                    <strong>{formatUsd.format(item.card.priceUsd ?? 0)}</strong>
                  </div>
                ))}
              </div>
            ) : idleRouletteItems.length ? (
              <div className="roulette-track preview-track">
                {idleRouletteItems.map((item) => (
                  <div
                    className={`roulette-item ${itemTypeOf(item.card)}`}
                    key={item.spinKey}
                    style={{ "--rarity": selectedPack.accent } as CSSProperties}
                  >
                    <img src={cardImage(item.card)} alt="" />
                    <small>{prizeTypeLabels[itemTypeOf(item.card)]}</small>
                    <span>{item.card.name}</span>
                    <strong>{formatUsd.format(item.card.priceUsd ?? 0)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="roulette-empty">
                <Dice5 size={34} aria-hidden />
                <strong>La ruleta espera el primer giro</strong>
                <span>Los premios pasan por la cinta y el selector central marca el ganador.</span>
              </div>
            )}
          </div>

          {!session && (
            <p className="inline-warning">
              Necesitas una cuenta para abrir cajas. El login esta en la pagina principal.
            </p>
          )}

          <div className="open-actions">
            <button
              className="open-button"
              disabled={
                !session ||
                !selectedPack.items.length ||
                visibleRoulettePhase === "spinning" ||
                openingPack
              }
              onClick={() => void openPack()}
              type="button"
            >
              <Sparkles size={19} aria-hidden />
              {openingPack
                ? "Procesando"
                : visibleRoulettePhase === "spinning"
                  ? "Girando"
                  : "Abrir caja"}
            </button>
            {visibleRouletteResult && (
              <button
                className="secondary-action compact"
                onClick={() => {
                  if (visibleRouletteResult) {
                    showCardDetails(visibleRouletteResult.card);
                  }
                }}
                type="button"
              >
                <Eye size={18} aria-hidden />
                Ver resultado
              </button>
            )}
          </div>
          {authMessage && <p className="admin-message">{authMessage}</p>}

          {visibleRouletteResult && (
            <article
              className={`result-banner ${itemTypeOf(visibleRouletteResult.card)} ${
                normalizedProbability(visibleRouletteResult, selectedPack) <
                HIT_PROBABILITY_THRESHOLD
                  ? "hit-result"
                  : ""
              }`}
            >
              <img
                src={cardImage(visibleRouletteResult.card)}
                alt=""
                onError={handleImageError(visibleRouletteResult.card.game)}
              />
              <div>
                <span>Te llevaste</span>
                <small>{prizeTypeLabels[itemTypeOf(visibleRouletteResult.card)]}</small>
                <h3>{visibleRouletteResult.card.name}</h3>
                <strong>
                  {formatUsd.format(visibleRouletteResult.card.priceUsd ?? 0)}
                </strong>
              </div>
            </article>
          )}
        </div>

        <aside className="case-summary">
          <div className="metric-strip">
            <div>
              <Trophy size={18} aria-hidden />
              <span>
                <small>Mejor premio</small>
                <strong>{selectedTopItem?.card.name ?? "Sin premios"}</strong>
              </span>
            </div>
          </div>

          <div className="recent-drops">
            <h3>Mejores caidas</h3>
            {recentDropsLoading ? (
              <p>Cargando hits recientes.</p>
            ) : recentDrops.length ? (
              recentDrops.map((drop) => (
                <button
                  className="drop-row"
                  key={drop.id}
                  onClick={() => showCardDetails(drop.card)}
                  type="button"
                >
                  <img
                    src={cardImage(drop.card)}
                    alt=""
                    onError={handleImageError(drop.card.game)}
                  />
                  <span className="drop-copy">
                    <strong>{drop.card.name}</strong>
                    <small>
                      {drop.displayName || drop.username} - {drop.packName}
                    </small>
                    <em>{formatCardDate(drop.acquiredAt)}</em>
                  </span>
                  <b>{formatUsd.format(drop.valueUsd)}</b>
                </button>
              ))
            ) : (
              <p>Todavia no hay hits registrados en esta caja.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );

  const missingPackSection = (
    <section className="case-layout page-section" aria-label="Caja no encontrada">
      <div className="login-panel">
        <span className="eyebrow">Caja</span>
        <h3>
          {apiStatus === "checking"
            ? "Buscando la caja"
            : "No encontre esta caja"}
        </h3>
        <p className="admin-message">
          Confirma que el servidor local este corriendo y reintenta.
        </p>
        <div className="auth-actions">
          <button
            className="secondary-action compact"
            onClick={() => void loadDbPacks()}
            type="button"
          >
            <RotateCcw size={17} aria-hidden />
            Reintentar
          </button>
          <Link className="primary-action compact" href="/">
            <Home size={17} aria-hidden />
            Ver cajas
          </Link>
        </div>
      </div>
    </section>
  );

  const contentsSection = (
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

  const adminStockSection = (
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

  const adminOrdersSection = (
    <section className="admin-band page-section" aria-label="Pedidos de Pullario">
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="orders-panel">
          <div className="admin-metrics wide shipping-metrics">
            <span>
              <small>Retiros activos</small>
              <strong>{withdrawnOrderCount}</strong>
            </span>
            <span>
              <small>Usuarios</small>
              <strong>{groupedShopOrders.length}</strong>
            </span>
          </div>
          <div className="shipping-toolbar">
            <div>
              <strong>{selectedShipmentIds.length} seleccionados</strong>
              <small>
                Selecciona premios de un mismo usuario para armar un paquete.
              </small>
            </div>
            <div className="shipping-toolbar-actions">
              <button
                className="secondary-action compact"
                onClick={() => void loadShopOrders()}
                type="button"
              >
                <RotateCcw size={16} aria-hidden />
                Refrescar
              </button>
              <button
                className="primary-action compact"
                disabled={!selectedShipmentsReady || shippingOrders}
                onClick={() => setShippingModalOpen(true)}
                type="button"
              >
                <Send size={16} aria-hidden />
                {shippingOrders ? "Confirmando" : "Marcar como enviados"}
              </button>
            </div>
          </div>
          {ordersMessage && <p className="admin-message">{ordersMessage}</p>}
          <div className="order-list grouped-orders">
            {groupedShopOrders.length ? (
              groupedShopOrders.map((group) => (
                <section className="order-user-group" key={group.userId}>
                  <div className="order-user-heading">
                    <span className="order-user-avatar" aria-hidden>
                      <User size={18} />
                    </span>
                    <span>
                      <strong>{group.displayName || group.username}</strong>
                      {group.displayName && <small>@{group.username}</small>}
                    </span>
                    <span className="order-user-count">
                      {group.orders.length} {group.orders.length === 1 ? "premio" : "premios"}
                    </span>
                    <button
                      className="group-select-action"
                      onClick={() => {
                        const groupIds = group.orders.map((order) => order.id);
                        const allSelected = groupIds.every((id) =>
                          selectedShipmentIds.includes(id),
                        );
                        setSelectedShipmentIds(allSelected ? [] : groupIds);
                      }}
                      type="button"
                    >
                      {group.orders.every((order) =>
                        selectedShipmentIds.includes(order.id),
                      )
                        ? "Quitar seleccion"
                        : "Seleccionar todos"}
                    </button>
                  </div>
                  <div className="order-user-items">
                    {group.orders.map((order) => (
                      <article
                        className={`order-card ${itemTypeOf(order.card)}`}
                        key={order.id}
                      >
                        <label className="shipment-checkbox">
                          <input
                            checked={selectedShipmentIds.includes(order.id)}
                            disabled={Boolean(
                              selectedShipmentUserId &&
                                selectedShipmentUserId !== order.userId,
                            )}
                            onChange={() => toggleShipmentSelection(order.id)}
                            type="checkbox"
                          />
                          <span aria-hidden />
                          <span className="sr-only">
                            Seleccionar retiro de {order.card.name}
                          </span>
                        </label>
                        <img
                          src={cardImage(order.card)}
                          alt=""
                          onError={handleImageError(order.card.game)}
                        />
                        <div>
                          <span className={`status-chip ${order.status}`}>
                            {orderStatusLabels[order.status]}
                          </span>
                          <span
                            className={`prize-type-chip ${itemTypeOf(order.card)}`}
                          >
                            {prizeTypeLabels[itemTypeOf(order.card)]}
                          </span>
                          <strong>{order.card.name}</strong>
                          <small>
                            {order.packName} - {formatUsd.format(order.valueUsd)}
                          </small>
                          <small>Ganada: {formatCardDate(order.acquiredAt)}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="empty-list">
                No hay retiros confirmados pendientes de envio.
              </p>
            )}
          </div>
        </div>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );

  const visibleShipmentGroups =
    shipmentView === "active" ? activeShipmentGroups : shipmentHistoryGroups;

  const adminShipmentsSection = (
    <section className="admin-band page-section" aria-label="Envios de Pullario">
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="shipments-panel">
          <div className="shipment-view-tabs" aria-label="Estado de los envios">
            <button
              className={shipmentView === "active" ? "active" : ""}
              onClick={() => setShipmentView("active")}
              type="button"
            >
              Activos <span>{activeShipmentGroups.length}</span>
            </button>
            <button
              className={shipmentView === "history" ? "active" : ""}
              onClick={() => setShipmentView("history")}
              type="button"
            >
              Historial <span>{shipmentHistoryGroups.length}</span>
            </button>
            <button
              className="shipment-refresh"
              onClick={() => void loadShopShipments()}
              type="button"
            >
              <RotateCcw size={16} aria-hidden />
              Refrescar
            </button>
          </div>
          {shipmentsMessage && (
            <p className="admin-message">{shipmentsMessage}</p>
          )}
          <div className="shipment-group-list">
            {visibleShipmentGroups.length ? (
              visibleShipmentGroups.map((group) => (
                <article className="shipment-group" key={group.key}>
                  <div className="shipment-group-heading">
                    <span className="order-user-avatar" aria-hidden>
                      <Truck size={18} />
                    </span>
                    <div>
                      <span className="eyebrow">
                        {shipmentView === "active" ? "En camino" : "Recibido"}
                      </span>
                      <strong>{group.displayName || group.username}</strong>
                      <small>@{group.username}</small>
                    </div>
                    <div className="tracking-summary">
                      <small>Seguimiento</small>
                      <strong>{group.trackingNumber}</strong>
                    </div>
                  </div>
                  <div className="shipment-prizes">
                    {group.items.map((item) => (
                      <div className="shipment-prize" key={item.id}>
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span>
                          <strong>{item.card.name}</strong>
                          <small>{formatUsd.format(item.valueUsd)}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="shipment-group-footer">
                    <span>
                      <small>
                        {shipmentView === "active" ? "Enviado" : "Recibido"}
                      </small>
                      <strong>
                        {formatCardDate(
                          shipmentView === "active"
                            ? group.shippedAt
                            : group.deliveredAt,
                        )}
                      </strong>
                    </span>
                    {shipmentView === "active" && (
                      <button
                        className="primary-action compact"
                        disabled={shipmentBusyKey === group.key}
                        onClick={() =>
                          void markShipmentReceived(
                            group.items.map((item) => item.id),
                            group.key,
                          )
                        }
                        type="button"
                      >
                        <CircleCheck size={16} aria-hidden />
                        {shipmentBusyKey === group.key
                          ? "Confirmando"
                          : "Marcar como recibido"}
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-list">
                {shipmentView === "active"
                  ? "No hay envios activos en este momento."
                  : "Todavia no hay entregas confirmadas."}
              </p>
            )}
          </div>
        </div>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );

  const adminUsersSection = (
    <section
      className="admin-band page-section"
      aria-label="Inventarios de usuarios"
    >
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="admin-users-layout">
          <aside className="admin-user-browser">
            <form
              className="admin-user-search"
              onSubmit={(event) => {
                event.preventDefault();
                void loadAdminUsers(adminUserQuery);
              }}
            >
              <label>
                Buscar usuario
                <input
                  onChange={(event) => setAdminUserQuery(event.target.value)}
                  placeholder="Usuario, nombre o email"
                  type="search"
                  value={adminUserQuery}
                />
              </label>
              <button className="primary-action compact" type="submit">
                <Search size={16} aria-hidden />
                Buscar
              </button>
            </form>
            <div className="admin-user-list">
              {adminUsers.map((user) => (
                <button
                  className={selectedAdminUser?.id === user.id ? "active" : ""}
                  key={user.id}
                  onClick={() => void loadAdminUserCards(user)}
                  type="button"
                >
                  <span className="order-user-avatar" aria-hidden>
                    <User size={17} />
                  </span>
                  <span>
                    <strong>{user.displayName || user.username}</strong>
                    <small>@{user.username}</small>
                  </span>
                </button>
              ))}
              {!adminUsers.length && !adminUsersLoading && (
                <p className="empty-list">No se encontraron usuarios.</p>
              )}
            </div>
          </aside>

          <div className="admin-user-inventory">
            {selectedAdminUser ? (
              <>
                <div className="admin-user-inventory-heading">
                  <div>
                    <span className="eyebrow">Inventario</span>
                    <h2>
                      {selectedAdminUser.displayName || selectedAdminUser.username}
                    </h2>
                    <small>@{selectedAdminUser.username}</small>
                  </div>
                  <div className="admin-user-totals">
                    <div className="admin-user-value">
                      <small>Total gastado</small>
                      <strong>
                        {formatUsd.format(
                          Number(selectedAdminUser.spentValueUsd) || 0,
                        )}
                      </strong>
                    </div>
                    <div className="admin-user-value">
                      <small>Valor retirado</small>
                      <strong>
                        {formatUsd.format(
                          Number(selectedAdminUser.withdrawnValueUsd) || 0,
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="shipment-view-tabs admin-user-view-tabs">
                  <button
                    className={adminUserView === "inventory" ? "active" : ""}
                    onClick={() => setAdminUserView("inventory")}
                    type="button"
                  >
                    <Boxes size={16} aria-hidden />
                    Inventario
                  </button>
                  <button
                    className={adminUserView === "shipments" ? "active" : ""}
                    onClick={() => setAdminUserView("shipments")}
                    type="button"
                  >
                    <Truck size={16} aria-hidden />
                    Retiros y envios
                  </button>
                </div>
                {adminUserView === "inventory" ? (
                  <>
                    <div className="admin-inventory-filters">
                      <label className="switch-control">
                        <input
                          checked={adminInventoryActiveOnly}
                          onChange={(event) =>
                            setAdminInventoryActiveOnly(event.target.checked)
                          }
                          role="switch"
                          type="checkbox"
                        />
                        <span className="switch-track" aria-hidden>
                          <span />
                        </span>
                        <span>Solo activos</span>
                      </label>
                      <label>
                        Precio minimo
                        <input
                          inputMode="decimal"
                          onChange={(event) =>
                            setAdminInventoryMinPrice(event.target.value)
                          }
                          placeholder="0"
                          type="text"
                          value={adminInventoryMinPrice}
                        />
                      </label>
                      <label>
                        Precio maximo
                        <input
                          inputMode="decimal"
                          onChange={(event) =>
                            setAdminInventoryMaxPrice(event.target.value)
                          }
                          placeholder="Sin limite"
                          type="text"
                          value={adminInventoryMaxPrice}
                        />
                      </label>
                      <SortControl
                        ariaLabel="Ordenar inventario del usuario"
                        onChange={(value) =>
                          setAdminInventorySort(
                            value as typeof adminInventorySort,
                          )
                        }
                        options={[
                          { value: "date-desc", label: "Mas recientes" },
                          { value: "date-asc", label: "Mas antiguos" },
                          { value: "price-desc", label: "Mayor precio" },
                          { value: "price-asc", label: "Menor precio" },
                        ]}
                        value={adminInventorySort}
                      />
                    </div>
                    <div className="admin-user-card-list">
                      {visibleAdminUserCards.map((item) => (
                        <article
                          className={`inventory-card ${itemTypeOf(item.card)}`}
                          key={item.id}
                        >
                          <img
                            src={cardImage(item.card)}
                            alt=""
                            onError={handleImageError(item.card.game)}
                          />
                          <div>
                            <span className={`status-chip ${item.status}`}>
                              {cardStatusLabels[item.status]}
                            </span>
                            <strong>{item.card.name}</strong>
                            <small>
                              {item.packName} - {formatUsd.format(item.valueUsd)}
                            </small>
                            <small>Ganada: {formatCardDate(item.acquiredAt)}</small>
                          </div>
                        </article>
                      ))}
                      {!visibleAdminUserCards.length && !adminUsersLoading && (
                        <p className="empty-list">
                          No hay premios que coincidan con estos filtros.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="shipment-group-list admin-user-shipments">
                    {adminUserWithdrawalGroups.map((group) => (
                      <article className="shipment-group" key={group.key}>
                        <div className="shipment-group-heading">
                          <span className="order-user-avatar" aria-hidden>
                            <Truck size={18} />
                          </span>
                          <div>
                            <span className="eyebrow">
                              {group.shipmentStatus === "delivered"
                                ? "Recibido"
                                : group.shipmentStatus === "shipped"
                                  ? "En camino"
                                  : "Pendiente de envio"}
                            </span>
                            <strong>
                              {group.items.length === 1
                                ? "1 premio en este paquete"
                                : `${group.items.length} premios en este paquete`}
                            </strong>
                          </div>
                          <div className="tracking-summary">
                            <small>Numero de seguimiento</small>
                            <strong>
                              {group.trackingNumber || "Pendiente de asignar"}
                            </strong>
                          </div>
                        </div>
                        <div className="shipment-prizes">
                          {group.items.map((item) => (
                            <div className="shipment-prize" key={item.id}>
                              <img
                                src={cardImage(item.card)}
                                alt=""
                                onError={handleImageError(item.card.game)}
                              />
                              <span>
                                <strong>{item.card.name}</strong>
                                <small>{formatUsd.format(item.valueUsd)}</small>
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="shipment-group-footer">
                          <span>
                            <small>
                              {group.shipmentStatus === "delivered"
                                ? "Recibido"
                                : group.shipmentStatus === "shipped"
                                  ? "Enviado"
                                  : "Retiro solicitado"}
                            </small>
                            <strong>
                              {formatCardDate(
                                group.deliveredAt ??
                                  group.shippedAt ??
                                  group.items[0]?.acquiredAt,
                              )}
                            </strong>
                          </span>
                          <strong>
                            {formatUsd.format(
                              group.items.reduce(
                                (total, item) => total + item.valueUsd,
                                0,
                              ),
                            )}
                          </strong>
                        </div>
                      </article>
                    ))}
                    {!adminUserWithdrawalGroups.length && !adminUsersLoading && (
                      <p className="empty-list">
                        Este usuario todavia no tiene retiros confirmados.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="admin-user-empty">
                <User size={24} aria-hidden />
                <h2>Selecciona un usuario</h2>
                <p>Su inventario y sus filtros apareceran en este panel.</p>
              </div>
            )}
            {adminUsersMessage && (
              <p className="admin-message">{adminUsersMessage}</p>
            )}
          </div>
        </div>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );

  const adminSection =
    view === "admin-stock"
      ? adminStockSection
      : view === "admin-packs"
        ? <AdminPacksSection />
        : view === "admin-orders"
          ? adminOrdersSection
          : view === "admin-shipments"
            ? adminShipmentsSection
            : view === "admin-users"
              ? adminUsersSection
          : <AdminDashboardSection />;

  const pageTransitionKey = [view, initialPackId ?? ""].join(":");

  return (
    <MarketContext.Provider value={market}>
    <main className="market-shell design-v3">
      <AppHeader />

      <div
        className={`page-transition ${
          view === "cards" ? "cards-page-transition" : ""
        }`}
        key={pageTransitionKey}
      >
        {view === "home" && <HomeView />}

        {view === "pack" &&
          (selectedPackExists ? (
            <>
              {openingSection}
              {contentsSection}
            </>
          ) : (
            missingPackSection
          ))}
        {view === "cards" && <CardsSearchSection />}
        {view === "upgrader" && <UpgraderSection />}
        {view === "changer" && <ChangerSection />}
        {view.startsWith("admin") && adminSection}
        {view === "profile" && <ProfileSection />}
        <SiteFooter />
      </div>

      <AuthModal />

      {shippingModalOpen && (
        <div
          className="modal-backdrop"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !shippingOrders) {
              setShippingModalOpen(false);
            }
          }}
          role="presentation"
        >
          <article
            aria-labelledby="shipping-modal-title"
            aria-modal="true"
            className="utility-modal shipping-modal"
            role="dialog"
          >
            <button
              aria-label="Cerrar confirmacion de envio"
              className="modal-close"
              disabled={shippingOrders}
              onClick={() => setShippingModalOpen(false)}
              type="button"
            >
              <X size={18} aria-hidden />
            </button>
            <span className="eyebrow">Confirmar despacho</span>
            <h2 id="shipping-modal-title">
              {selectedShipmentIds.length}{" "}
              {selectedShipmentIds.length === 1 ? "premio" : "premios"}
            </h2>
            <p>
              El mismo numero de seguimiento se aplicara a todos los premios
              seleccionados de este usuario.
            </p>
            <label>
              Numero de seguimiento
              <input
                autoFocus
                onChange={(event) =>
                  setShipmentTrackingNumber(event.target.value)
                }
                placeholder="Ej: AR123456789"
                type="text"
                value={shipmentTrackingNumber}
              />
            </label>
            <div className="shipping-modal-actions">
              <button
                className="secondary-action compact"
                disabled={shippingOrders}
                onClick={() => setShippingModalOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="primary-action compact"
                disabled={
                  shippingOrders || shipmentTrackingNumber.trim().length < 3
                }
                onClick={() => void markSelectedOrdersShipped()}
                type="button"
              >
                <Send size={16} aria-hidden />
                {shippingOrders ? "Confirmando" : "Confirmar envio"}
              </button>
            </div>
          </article>
        </div>
      )}

      {stockEditor && (
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
      )}

      <WalletModal />

      <WonCardsModal />

      <NoticeToast />

      <SelectedCardModal />
    </main>
    </MarketContext.Provider>
  );
}
