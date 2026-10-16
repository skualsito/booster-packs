/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { AdminDashboardSection } from "./market/admin/AdminDashboardSection";
import {
  AdminOrdersSection,
  ShippingModal,
} from "./market/admin/AdminOrdersSection";
import { AdminPacksSection } from "./market/admin/AdminPacksSection";
import {
  AdminShellHeader,
  SellerRequiredPanel,
} from "./market/admin/AdminShell";
import { AdminShipmentsSection } from "./market/admin/AdminShipmentsSection";
import { AdminStockSection } from "./market/admin/AdminStockSection";
import { StockEditModal } from "./market/admin/StockEditModal";
import { AuthModal } from "./market/auth/AuthPanel";
import { cardImage, handleImageError } from "./market/card-display";
import {
  CardsSearchSection,
  SelectedCardModal,
} from "./market/cards/CardsSearchSection";
import {
  cardStatusLabels,
  gameLabels,
  isSellerRole,
  itemTypeOf,
  prizeTypeLabels,
} from "./market/catalog";
import { ChangerSection } from "./market/changer/ChangerSection";
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
  Dice5,
  Eye,
  Home,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
  Truck,
  User,
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
    adminInventoryActiveOnly,
    adminInventoryMaxPrice,
    adminInventoryMinPrice,
    adminInventorySort,
    adminUserQuery,
    adminUsers,
    adminUsersLoading,
    adminUsersMessage,
    adminUserView,
    adminUserWithdrawalGroups,
    apiStatus,
    authMessage,
    celebratingRunId,
    idleRouletteItems,
    loadAdminUserCards,
    loadAdminUsers,
    loadDbPacks,
    openingPack,
    openPack,
    recentDrops,
    recentDropsLoading,
    rouletteTrackRef,
    selectedAdminUser,
    selectedPack,
    selectedPackExists,
    selectedTopItem,
    session,
    setAdminInventoryActiveOnly,
    setAdminInventoryMaxPrice,
    setAdminInventoryMinPrice,
    setAdminInventorySort,
    setAdminUserQuery,
    setAdminUserView,
    showCardDetails,
    visibleAdminUserCards,
    visibleRouletteItems,
    visibleRouletteOffset,
    visibleRoulettePhase,
    visibleRouletteResult,
    visibleRouletteRunId,
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
      ? <AdminStockSection />
      : view === "admin-packs"
        ? <AdminPacksSection />
        : view === "admin-orders"
          ? <AdminOrdersSection />
          : view === "admin-shipments"
            ? <AdminShipmentsSection />
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

      <ShippingModal />

      <StockEditModal />

      <WalletModal />

      <WonCardsModal />

      <NoticeToast />

      <SelectedCardModal />
    </main>
    </MarketContext.Provider>
  );
}
