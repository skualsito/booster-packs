/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { CardGame, PrizeItemType } from "./lib/card-search";
import {
  cardImage,
  handleImageError,
  localImageUrl,
} from "./market/card-display";
import {
  argentinaProvinces,
  cardGames,
  cardStatusLabels,
  gameLabels,
  isSellerRole,
  itemTypeOf,
  orderStatusLabels,
  prizeItemTypes,
  prizeTypeLabels,
  prizeTypeShortLabels,
  roleLabels,
} from "./market/catalog";
import { CardModal } from "./market/components/CardModal";
import { SearchConsole } from "./market/components/SearchConsole";
import { SortControl } from "./market/components/SortControl";
import {
  HIT_CELEBRATION_PIECES,
  HIT_PROBABILITY_THRESHOLD,
} from "./market/constants";
import { formatCardDate, formatPercent, formatUsd } from "./market/format";
import { useMarketState } from "./market/hooks/useMarketState";
import { MarketContext } from "./market/MarketContext";
import {
  normalizedProbability,
  normalizeItems,
  packHitChance,
  topItem,
} from "./market/pack-math";
import type {
  AppView,
  BoosterPack,
  PackGame,
  ShopStockItem,
} from "./market/types";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Boxes,
  CircleCheck,
  CircleX,
  Database,
  Dice5,
  Eye,
  Home,
  Info,
  LockKeyhole,
  LogIn,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  Trophy,
  Truck,
  User,
  UserPlus,
  Wallet,
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
    activeShipments,
    addCardToDraft,
    addCardToStock,
    addChangerTarget,
    addSealedProductToStock,
    adminInventoryActiveOnly,
    adminInventoryMaxPrice,
    adminInventoryMinPrice,
    adminInventorySort,
    adminMessage,
    adminSaving,
    adminSearch,
    adminUserQuery,
    adminUsers,
    adminUsersLoading,
    adminUsersMessage,
    adminUserView,
    adminUserWithdrawalGroups,
    apiStatus,
    authMessage,
    authMode,
    celebratingRunId,
    changerGame,
    changerLoading,
    changerOutcome,
    changerQuery,
    changerRefund,
    changerSaving,
    changerSelectedTargets,
    changerStakeCards,
    changerStakeIds,
    changerStakeValue,
    changerTargetQuantities,
    changerTargetUnits,
    changerTargetValue,
    chooseUpgraderPreset,
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
    filteredChangerTargets,
    filteredShopStock,
    filteredUpgraderTargets,
    groupedShopOrders,
    heroShowcaseItems,
    homeAuthOpen,
    idleRouletteItems,
    inventoryActiveOnly,
    inventoryPriceSort,
    loadAdminUserCards,
    loadAdminUsers,
    loadDbPacks,
    loadShopOrders,
    loadShopShipments,
    loadShopStock,
    loadWonCards,
    loginEmail,
    loginPassword,
    loginUsername,
    logout,
    manualSealedOpen,
    markSelectedOrdersShipped,
    markShipmentReceived,
    openingPack,
    openPack,
    openStockEditor,
    ordersMessage,
    ownedWonCards,
    ownedWonCardsValue,
    packBuilderStock,
    packPrizeFilter,
    packs,
    packStockGameFilter,
    playChanger,
    playUpgrader,
    profileAddressReference,
    profileApartment,
    profileCity,
    profileCountry,
    profileDisplayName,
    profileEmail,
    profileFloor,
    profileFullName,
    profileMessage,
    profilePassword,
    profilePhone,
    profilePostalCode,
    profilePrizeView,
    profileProvince,
    profileSaving,
    profileSectionView,
    profileStreet,
    profileStreetNumber,
    publicSearch,
    recentDrops,
    recentDropsLoading,
    removeChangerTarget,
    removeDraftItem,
    resetDraftPack,
    rouletteTrackRef,
    runSearch,
    saveDraftPack,
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
    selectedCard,
    selectedPack,
    selectedPackExists,
    selectedShipmentIds,
    selectedShipmentsReady,
    selectedShipmentUserId,
    selectedTopItem,
    selectSealedSearchResult,
    sellerPacks,
    sellWonCard,
    session,
    setAdminInventoryActiveOnly,
    setAdminInventoryMaxPrice,
    setAdminInventoryMinPrice,
    setAdminInventorySort,
    setAdminSearch,
    setAdminUserQuery,
    setAdminUserView,
    setAuthMode,
    setChangerGame,
    setChangerQuery,
    setDraftGame,
    setDraftItems,
    setDraftName,
    setDraftPrice,
    setDraftPriceSort,
    setDraftSeries,
    setHomeAuthOpen,
    setInventoryActiveOnly,
    setInventoryPriceSort,
    setLoginEmail,
    setLoginPassword,
    setLoginUsername,
    setManualSealedOpen,
    setPackPrizeFilter,
    setPackStockGameFilter,
    setProfileAddressReference,
    setProfileApartment,
    setProfileCity,
    setProfileCountry,
    setProfileDisplayName,
    setProfileEmail,
    setProfileFloor,
    setProfileFullName,
    setProfilePassword,
    setProfilePhone,
    setProfilePostalCode,
    setProfilePrizeView,
    setProfileProvince,
    setProfileSectionView,
    setProfileStreet,
    setProfileStreetNumber,
    setPublicSearch,
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
    setSelectedCard,
    setSelectedShipmentIds,
    setShipmentTrackingNumber,
    setShipmentView,
    setShippingModalOpen,
    setStockEditImageUrl,
    setStockEditor,
    setStockEditPrice,
    setStockGameFilter,
    setStockPrizeFilter,
    setStockQuantityDrafts,
    setUpgraderGame,
    setUpgraderMaxPrice,
    setUpgraderMinPrice,
    setUpgraderOutcome,
    setUpgraderPreset,
    setUpgraderQuery,
    setUpgraderTargetId,
    setUpgraderTargetQuantity,
    setWalletAmount,
    setWalletOpen,
    setWonCardsMessage,
    setWonCardsOpen,
    shipmentBusyKey,
    shipmentHistoryGroups,
    shipmentsMessage,
    shipmentTrackingNumber,
    shipmentView,
    shippingModalOpen,
    shippingOrders,
    shopStock,
    showCardDetails,
    sortedDraftItems,
    startEditingPack,
    stockBusyId,
    stockCountsByGame,
    stockCountsByType,
    stockEditError,
    stockEditImageUrl,
    stockEditor,
    stockEditPrice,
    stockEditSaving,
    stockGameFilter,
    stockMessage,
    stockPrizeFilter,
    stockQuantityDrafts,
    stockQuantityForCard,
    submitAuth,
    toggleChangerStake,
    toggleShipmentSelection,
    toggleUpgraderStake,
    topUpWallet,
    updateDraftProbability,
    updateProfile,
    updateStockQuantity,
    upgraderChance,
    upgraderGame,
    upgraderLoading,
    upgraderMaxPrice,
    upgraderMinPrice,
    upgraderMultiplier,
    upgraderNeedleRef,
    upgraderOutcome,
    upgraderPlaying,
    upgraderPreset,
    upgraderQuery,
    upgraderRotation,
    upgraderStakeCards,
    upgraderStakeIds,
    upgraderStakeValue,
    upgraderTarget,
    upgraderTargetId,
    upgraderTargetMaxQuantity,
    upgraderTargetQuantity,
    upgraderTargetValue,
    userWithdrawalGroups,
    visibleAdminUserCards,
    visibleInventoryCards,
    visibleRouletteItems,
    visibleRouletteOffset,
    visibleRoulettePhase,
    visibleRouletteResult,
    visibleRouletteRunId,
    walletAmount,
    walletMessage,
    walletOpen,
    walletSaving,
    withdrawnOrderCount,
    withdrawWonCard,
    wonCardBusyId,
    wonCardsMessage,
    wonCardsMessageTone,
    wonCardsOpen,
  } = market;

  const authPanel = session ? (
    <div className="auth-panel logged-in">
      <span className="eyebrow">Sesion activa</span>
      <h3>{session.displayName || session.username}</h3>
      <p>{roleLabels[session.role]}</p>
      <div className="auth-actions">
        <Link className="secondary-action compact" href="/profile">
          <User size={17} aria-hidden />
          Mi cuenta
        </Link>
        {isSellerRole(session.role) && (
          <Link className="primary-action compact" href="/admin">
            <Settings size={17} aria-hidden />
            Abrir administrador
          </Link>
        )}
        <button className="secondary-action compact" onClick={logout} type="button">
          <LockKeyhole size={17} aria-hidden />
          Salir
        </button>
      </div>
      {authMessage && <p className="admin-message">{authMessage}</p>}
    </div>
  ) : (
    <form
      className="auth-panel"
      onSubmit={(event) => {
        event.preventDefault();
        void submitAuth();
      }}
    >
      <div className="auth-switch" aria-label="Modo de acceso">
        <button
          className={authMode === "login" ? "active" : ""}
          onClick={() => setAuthMode("login")}
          type="button"
        >
          <LogIn size={16} aria-hidden />
          Entrar
        </button>
        <button
          className={authMode === "register" ? "active" : ""}
          onClick={() => setAuthMode("register")}
          type="button"
        >
          <UserPlus size={16} aria-hidden />
          Registrarse
        </button>
      </div>
      <label>
        Usuario
        <input
          autoComplete="username"
          onChange={(event) => setLoginUsername(event.target.value)}
          value={loginUsername}
        />
      </label>
      {authMode === "register" && (
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setLoginEmail(event.target.value)}
            type="email"
            value={loginEmail}
          />
        </label>
      )}
      <label>
        Password
        <input
          autoComplete={
            authMode === "register" ? "new-password" : "current-password"
          }
          onChange={(event) => setLoginPassword(event.target.value)}
          type="password"
          value={loginPassword}
        />
      </label>
      <button
        className="primary-action compact"
        disabled={!loginUsername.trim() || !loginPassword.trim()}
        type="submit"
      >
        {authMode === "register" ? (
          <UserPlus size={17} aria-hidden />
        ) : (
          <ShieldCheck size={17} aria-hidden />
        )}
        {authMode === "register" ? "Crear cuenta" : "Iniciar sesion"}
      </button>
      {authMessage && <p className="admin-message">{authMessage}</p>}
    </form>
  );

  const renderPackCards = (packList: BoosterPack[]) => (
      <div className="pack-grid">
        {packList.map((pack) => {
          const top = topItem(pack);

          return (
            <Link
              className="pack-card"
              href={`/packs/${encodeURIComponent(pack.id)}`}
              key={pack.id}
              style={{ "--accent": pack.accent } as CSSProperties}
            >
              <span className="pack-preview">
                {top?.card.imageUrl ? (
                  <img src={cardImage(top.card)} alt="" />
                ) : (
                  <Database size={26} aria-hidden />
                )}
              </span>
              <span className="pack-card-copy">
                <span className="pack-source">
                  {gameLabels[pack.game]} · Pullario
                </span>
                <span className="pack-name">{pack.name}</span>
                <span className="pack-series">{pack.series}</span>
              </span>
              <span className="pack-card-footer">
                <span>
                  <small>Precio</small>
                  <strong>{formatUsd.format(pack.price)}</strong>
                </span>
                <span>
                  <small>Hit</small>
                  <strong>{formatPercent.format(packHitChance(pack))}%</strong>
                </span>
                <span className="pack-open-icon" aria-hidden>
                  <ArrowRight size={22} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
  );

  const packListing = (
    <section className="case-layout" id="cajas" aria-label="Cajas disponibles">
      <div className="case-header">
        <div>
          <span className="eyebrow">Coleccion actual</span>
          <h2>Elige tu proxima caja</h2>
        </div>
        <p className="case-intro">
          Revisa los posibles premios antes de entrar a la apertura.
        </p>
      </div>

      {renderPackCards(packs)}
    </section>
  );

  const homeGuideSection = (
    <section
      className="home-guide-band"
      id="como-funciona"
      aria-label="Como funciona Pullario"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Como funciona</span>
          <h2>De la caja a tu inventario</h2>
        </div>
        <p>
          Una apertura simple, con los premios y sus probabilidades disponibles
          antes de elegir.
        </p>
      </div>

      <ol className="home-steps">
        <li>
          <span>01</span>
          <div>
            <h3>Elegi una caja</h3>
            <p>Explora el contenido, los precios y las probabilidades.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Abrila en la ruleta</h3>
            <p>El resultado se revela al terminar la animacion.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Decidi que hacer</h3>
            <p>Conserva el premio, vendelo por saldo o pedi el retiro.</p>
          </div>
        </li>
      </ol>

      <div className="home-shortcuts">
        <div>
          <span className="eyebrow">Tambien en Pullario</span>
          <h3>Explora cartas e inventario sin perder el foco.</h3>
        </div>
        <nav aria-label="Accesos de Pullario">
          <Link href="/cards">
            <Search size={18} aria-hidden />
            Buscar cartas
          </Link>
          <Link href="/profile">
            <Trophy size={18} aria-hidden />
            Ver inventario
          </Link>
        </nav>
      </div>
    </section>
  );

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

  const siteFooter = (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="footer-brand" href="/">
          <PackageOpen size={19} aria-hidden />
          Pullario
        </Link>
        <p>
          Prototipo web para abrir cajas TCG con probabilidades visibles,
          buscador de cartas e inventario de usuario.
        </p>
      </div>
      <div className="footer-links">
        <nav aria-label="Navegacion del pie">
          <strong>Explorar</strong>
          <Link href="/">Cajas</Link>
          <Link href="/upgrader">Upgrader</Link>
          <Link href="/changer">Changer</Link>
          <Link href="/cards">Cartas</Link>
          <Link href="#como-funciona">Indice</Link>
          <Link href="#confianza">Confianza</Link>
        </nav>
        <nav aria-label="Cuenta y administracion">
          <strong>Cuenta</strong>
          <Link href="/profile">Perfil</Link>
          <button
            onClick={() => {
              setWonCardsOpen(true);
              void loadWonCards();
            }}
            type="button"
          >
            Premios ganados
          </button>
          {isSellerRole(session?.role) && <Link href="/admin">Administracion</Link>}
        </nav>
      </div>
      <div className="footer-note">
        <strong>Demo local</strong>
        <span>
          Sin pagos reales. Antes de publicar con dinero real hay que revisar
          terminos, edad, impuestos, privacidad y normativa de azar.
        </span>
      </div>
    </footer>
  );

  const searchSection = (
    <section className="search-band standalone" aria-label="Buscador de cartas">
      <div className="search-copy">
        <span className="eyebrow">Buscador de cartas</span>
        <h1>Precios e imagenes</h1>
        <p>
          Busca por juego, nombre y rareza. Al tocar una carta se abre el detalle
          con imagen grande, precio, set y fuente.
        </p>
      </div>
      <SearchConsole
        actionLabel="Detalles"
        infinite
        onCardAction={showCardDetails}
        onLoadMore={() => runSearch("public", undefined, true)}
        onSearch={(override) => runSearch("public", override)}
        search={publicSearch}
        setSearch={setPublicSearch}
      />
    </section>
  );

  const adminNavigation = isSellerRole(session?.role) ? (
    <nav className="admin-nav" aria-label="Secciones de administracion">
      <Link className={view === "admin" ? "active" : ""} href="/admin">
        <Settings size={16} aria-hidden />
        Resumen
      </Link>
      <Link
        className={view === "admin-stock" ? "active" : ""}
        href="/admin/stock"
      >
        <Database size={16} aria-hidden />
        Stock
      </Link>
      <Link
        className={view === "admin-packs" ? "active" : ""}
        href="/admin/packs"
      >
        <PackageOpen size={16} aria-hidden />
        Cajas
      </Link>
      <Link
        className={view === "admin-orders" ? "active" : ""}
        href="/admin/orders"
      >
        <Trophy size={16} aria-hidden />
        Pedidos
      </Link>
      <Link
        className={view === "admin-shipments" ? "active" : ""}
        href="/admin/shipments"
      >
        <Truck size={16} aria-hidden />
        Envios activos
      </Link>
      <Link
        className={view === "admin-users" ? "active" : ""}
        href="/admin/users"
      >
        <User size={16} aria-hidden />
        Inventarios
      </Link>
    </nav>
  ) : null;

  const adminShellHeader = (
    <div className="admin-intro">
      <span className="eyebrow">
        Administrador local
      </span>
      <h1>
        {view === "admin-stock"
          ? "Gestionar stock"
          : view === "admin-packs"
            ? "Crear cajas"
            : view === "admin-orders"
              ? "Envios pendientes"
              : view === "admin-shipments"
                ? "Envios activos"
                : view === "admin-users"
                  ? "Inventarios de usuarios"
              : "Panel administrador"}
      </h1>
      <p>
        {view === "admin-stock"
          ? "Carga cartas y productos sellados al stock y separalos por TCG antes de armar cajas."
          : view === "admin-packs"
            ? "Arma y edita cajas usando unicamente premios disponibles en tu stock."
            : view === "admin-orders"
              ? "Gestiona unicamente los retiros confirmados que todavia deben enviarse."
              : view === "admin-shipments"
                ? "Sigue los paquetes despachados y guarda la confirmacion cuando el usuario los recibe."
                : view === "admin-users"
                  ? "Busca usuarios y revisa el historial completo de premios de cada cuenta."
              : "Administra stock, cajas publicadas y premios ganados por usuarios desde secciones separadas."}
      </p>
      {adminNavigation}
      {view === "admin-packs" && adminMessage && (
        <p className="admin-message">{adminMessage}</p>
      )}
    </div>
  );

  const sellerRequiredPanel = (
    <div className="login-panel">
      <span className="eyebrow">Administracion protegida</span>
      <h3>Entra como administrador desde la pagina principal</h3>
      <Link className="primary-action compact" href="/">
        <LogIn size={17} aria-hidden />
        Ir al login
      </Link>
    </div>
  );

  const stockFilterControls = (
    <div className="stock-filter-stack">
      <div className="stock-type-tabs" aria-label="Filtro de stock por TCG">
        <button
          className={stockGameFilter === "mixed" ? "active" : ""}
          onClick={() => setStockGameFilter("mixed")}
          type="button"
        >
          Todos <span>{shopStock.length}</span>
        </button>
        {cardGames.map((game) => (
          <button
            className={stockGameFilter === game ? "active" : ""}
            key={game}
            onClick={() => setStockGameFilter(game)}
            type="button"
          >
            {gameLabels[game]} <span>{stockCountsByGame[game]}</span>
          </button>
        ))}
      </div>
      <div className="stock-type-tabs" aria-label="Filtro por tipo de premio">
        <button
          className={stockPrizeFilter === "all" ? "active" : ""}
          onClick={() => setStockPrizeFilter("all")}
          type="button"
        >
          Todo tipo
        </button>
        {prizeItemTypes.map((itemType) => (
          <button
            className={stockPrizeFilter === itemType ? "active" : ""}
            key={itemType}
            onClick={() => setStockPrizeFilter(itemType)}
            type="button"
          >
            {prizeTypeShortLabels[itemType]}{" "}
            <span>{stockCountsByType[itemType]}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStockItem = (stockItem: ShopStockItem, withPackAction = false) => {
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
      key={stockItem.id}
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
  };

  const adminDashboardSection = (
    <section className="admin-band page-section" aria-label="Panel administrador">
      {adminShellHeader}
      {isSellerRole(session?.role) ? (
        <div className="admin-dashboard-grid">
          <Link className="admin-dashboard-card" href="/admin/stock">
            <Database size={30} aria-hidden />
            <span className="eyebrow">Stock</span>
            <strong>{shopStock.length} productos cargados</strong>
            <small>
              One Piece {stockCountsByGame["one-piece"]} - Pokemon{" "}
              {stockCountsByGame.pokemon} - Magic {stockCountsByGame.magic}
            </small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/packs">
            <PackageOpen size={30} aria-hidden />
            <span className="eyebrow">Cajas</span>
            <strong>{sellerPacks.length} cajas publicadas</strong>
            <small>Crear, editar y normalizar probabilidades.</small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/orders">
            <Trophy size={30} aria-hidden />
            <span className="eyebrow">Pedidos</span>
            <strong>{withdrawnOrderCount} retiros por enviar</strong>
            <small>Confirma despachos y registra numeros de seguimiento.</small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/shipments">
            <Truck size={30} aria-hidden />
            <span className="eyebrow">Envios activos</span>
            <strong>{activeShipments.length} premios en camino</strong>
            <small>Confirma recepciones y consulta entregas anteriores.</small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/users">
            <User size={30} aria-hidden />
            <span className="eyebrow">Inventarios</span>
            <strong>{adminUsers.length} usuarios cargados</strong>
            <small>Busca cuentas y revisa premios activos o historicos.</small>
          </Link>
        </div>
      ) : (
        sellerRequiredPanel
      )}
    </section>
  );

  const adminStockSection = (
    <section className="admin-band page-section" aria-label="Stock de Pullario">
      {adminShellHeader}
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
            {stockFilterControls}
            {stockMessage && <p className="admin-message">{stockMessage}</p>}
            <div className="stock-list expanded">
              {filteredShopStock.length ? (
                filteredShopStock.map((stockItem) => renderStockItem(stockItem))
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
        sellerRequiredPanel
      )}
    </section>
  );

  const adminPacksSection = (
    <section className="admin-band page-section" aria-label="Crear cajas">
      {adminShellHeader}
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
                  packBuilderStock.map((stockItem) =>
                    renderStockItem(stockItem, true),
                  )
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
        sellerRequiredPanel
      )}
    </section>
  );

  const adminOrdersSection = (
    <section className="admin-band page-section" aria-label="Pedidos de Pullario">
      {adminShellHeader}
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
        sellerRequiredPanel
      )}
    </section>
  );

  const visibleShipmentGroups =
    shipmentView === "active" ? activeShipmentGroups : shipmentHistoryGroups;

  const adminShipmentsSection = (
    <section className="admin-band page-section" aria-label="Envios de Pullario">
      {adminShellHeader}
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
        sellerRequiredPanel
      )}
    </section>
  );

  const adminUsersSection = (
    <section
      className="admin-band page-section"
      aria-label="Inventarios de usuarios"
    >
      {adminShellHeader}
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
        sellerRequiredPanel
      )}
    </section>
  );

  const adminSection =
    view === "admin-stock"
      ? adminStockSection
      : view === "admin-packs"
        ? adminPacksSection
        : view === "admin-orders"
          ? adminOrdersSection
          : view === "admin-shipments"
            ? adminShipmentsSection
            : view === "admin-users"
              ? adminUsersSection
          : adminDashboardSection;

  const upgraderSection = (
    <section className="upgrader-page page-section" aria-labelledby="upgrader-title">
      <div className="upgrader-heading">
        <span className="eyebrow">Upgrader</span>
        <h1 id="upgrader-title">Convertí tus premios en uno mejor</h1>
        <p>
          Elegí premios de tu inventario y apostalos por un objetivo de mayor
          valor. Si la rueda cae en la zona violeta, ganás el upgrade.
        </p>
      </div>

      {!session && (
        <div className="upgrader-guest-notice">
          <div>
            <span className="eyebrow">Modo demostración</span>
            <strong>Iniciá sesión para apostar tus premios</strong>
            <p>Podés explorar los objetivos y ver cómo funciona la ruleta.</p>
          </div>
          <button
            className="primary-action compact"
            onClick={() => {
              setAuthMode("login");
              setHomeAuthOpen(true);
            }}
            type="button"
          >
            <LogIn size={17} aria-hidden />
            Entrar
          </button>
        </div>
      )}

      <>
          <div className="upgrader-layout">
            <section className="upgrader-panel upgrader-stake-panel">
              <div className="upgrader-panel-heading">
                <div>
                  <span>Tu apuesta</span>
                  <strong>{formatUsd.format(upgraderStakeValue)}</strong>
                </div>
                <small>{upgraderStakeCards.length}/20 elegidos</small>
              </div>
              <div className={`upgrader-selection-card selection-tray${upgraderStakeCards.length ? " filled" : ""}`}>
                <div className="upgrader-selection-copy">
                  <small>Premios seleccionados</small>
                  <strong>
                    {upgraderStakeCards.length
                      ? `${upgraderStakeCards.length} ${upgraderStakeCards.length === 1 ? "premio" : "premios"}`
                      : "Elegí qué querés apostar"}
                  </strong>
                  <span>
                    {upgraderStakeCards.length
                      ? formatUsd.format(upgraderStakeValue)
                      : "Tu selección aparecerá acá"}
                  </span>
                </div>
                {upgraderStakeCards.length ? (
                  <div className="upgrader-selection-strip">
                    {upgraderStakeCards.map((item) => (
                      <button
                        aria-label={`Quitar ${item.card.name} de la apuesta`}
                        className="upgrader-selection-thumb"
                        disabled={upgraderPlaying}
                        key={item.id}
                        onClick={() => toggleUpgraderStake(item.id)}
                        title={`Quitar ${item.card.name}`}
                        type="button"
                      >
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span aria-hidden><X size={13} /></span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="upgrader-selection-empty" aria-hidden>
                    <Trophy size={28} />
                    <span>Tus premios aparecerán acá</span>
                  </div>
                )}
              </div>
              <div className="upgrader-item-list">
                {ownedWonCards.length ? (
                  ownedWonCards.map((item) => {
                    const selected = upgraderStakeIds.includes(item.id);
                    return (
                      <button
                        aria-pressed={selected}
                        className={`upgrader-item${selected ? " selected" : ""}`}
                        disabled={upgraderPlaying}
                        key={item.id}
                        onClick={() => toggleUpgraderStake(item.id)}
                        type="button"
                      >
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span>
                          <strong>{item.card.name}</strong>
                          <small>{item.card.setName}</small>
                        </span>
                        <b>{formatUsd.format(item.valueUsd)}</b>
                        <CircleCheck size={19} aria-hidden />
                      </button>
                    );
                  })
                ) : (
                  <div className="upgrader-empty">
                    <Trophy size={28} aria-hidden />
                    <strong>
                      {session ? "No tenés premios activos" : "Tu inventario aparecerá acá"}
                    </strong>
                    <p>
                      {session
                        ? "Abrí una caja para conseguir tu primer premio."
                        : "Iniciá sesión para elegir los premios que querés apostar."}
                    </p>
                    {session && <Link href="/">Ver cajas</Link>}
                  </div>
                )}
              </div>
            </section>

            <section className="upgrader-center" aria-label="Ruleta Upgrader">
              <div
                className={`upgrader-wheel${upgraderPlaying ? " spinning" : ""}`}
                style={
                  { "--upgrade-chance": `${upgraderChance}%` } as CSSProperties
                }
              >
                <div className="upgrader-wheel-scale" aria-hidden />
                <div
                  className="upgrader-needle"
                  ref={upgraderNeedleRef}
                  style={{ transform: `rotate(${upgraderRotation}deg)` }}
                  aria-hidden
                >
                  <i />
                </div>
                <div className="upgrader-wheel-core">
                  <ArrowUpDown size={35} aria-hidden />
                  <strong>{formatPercent.format(upgraderChance)}%</strong>
                  <small>probabilidad</small>
                </div>
              </div>

              <div className="upgrader-values">
                <div>
                  <small>Apostás</small>
                  <strong>{formatUsd.format(upgraderStakeValue)}</strong>
                </div>
                <ArrowRight size={20} aria-hidden />
                <div>
                  <small>Podés ganar</small>
                  <strong>{formatUsd.format(upgraderTargetValue)}</strong>
                </div>
              </div>
              <div className="upgrader-multiplier">
                <span>{upgraderMultiplier ? `${upgraderMultiplier.toFixed(2)}x` : "0.00x"}</span>
                <small>Retorno teórico 90% · máximo 80%</small>
              </div>
              <div className="upgrader-presets" aria-label="Objetivos rápidos">
                {[1.5, 2, 5, 10].map((multiplier) => (
                  <button
                    className={upgraderPreset === multiplier ? "active" : ""}
                    disabled={!session || upgraderPlaying}
                    key={multiplier}
                    onClick={() => chooseUpgraderPreset(multiplier)}
                    type="button"
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>
              <button
                className="primary-action upgrader-play"
                disabled={
                  upgraderPlaying ||
                  !session ||
                  !upgraderStakeIds.length ||
                  !upgraderTarget ||
                  upgraderChance <= 0
                }
                onClick={() => void playUpgrader()}
                type="button"
              >
                <Sparkles size={19} aria-hidden />
                {upgraderPlaying ? "Girando..." : "Intentar upgrade"}
              </button>
              <p className="upgrader-risk">
                Si no acertás, los premios apostados dejan de estar disponibles.
              </p>
            </section>

            <section className="upgrader-panel upgrader-target-panel">
              <div className="upgrader-panel-heading">
                <div>
                  <span>Premio objetivo</span>
                  <strong>{formatUsd.format(upgraderTargetValue)}</strong>
                </div>
                <small>{filteredUpgraderTargets.length} disponibles</small>
              </div>
              <div className={`upgrader-selection-card selection-tray${upgraderTarget ? " filled" : ""}`}>
                <div className="upgrader-selection-copy">
                  <small>Premio que podés ganar</small>
                  <strong>
                    {upgraderTarget?.card.name ?? "Elegí un premio objetivo"}
                  </strong>
                  <span>
                    {upgraderTarget
                      ? formatUsd.format(upgraderTargetValue)
                      : "Tu objetivo aparecerá acá"}
                  </span>
                </div>
                {upgraderTarget ? (
                  <div className="upgrader-target-selection-row">
                    <div className="upgrader-selection-strip target-strip">
                    <button
                      aria-label={`Quitar ${upgraderTarget.card.name} como objetivo`}
                      className="upgrader-selection-thumb"
                      disabled={upgraderPlaying}
                      onClick={() => {
                        setUpgraderOutcome(null);
                        setUpgraderTargetId(null);
                      }}
                      title={`Quitar ${upgraderTarget.card.name}`}
                      type="button"
                    >
                      <img
                        src={cardImage(upgraderTarget.card)}
                        alt=""
                        onError={handleImageError(upgraderTarget.card.game)}
                      />
                      <span aria-hidden><X size={13} /></span>
                    </button>
                    </div>
                    <div className="upgrader-target-quantity">
                      <small>Cantidad</small>
                      <div>
                        <button
                          aria-label="Quitar una unidad"
                          disabled={upgraderPlaying || upgraderTargetQuantity <= 1}
                          onClick={() =>
                            setUpgraderTargetQuantity((current) =>
                              Math.max(1, current - 1),
                            )
                          }
                          type="button"
                        >
                          −
                        </button>
                        <input
                          aria-label="Cantidad del premio objetivo"
                          disabled={upgraderPlaying}
                          inputMode="numeric"
                          max={upgraderTargetMaxQuantity}
                          min="1"
                          onChange={(event) => {
                            const quantity = Number(event.target.value);
                            if (Number.isFinite(quantity)) {
                              setUpgraderTargetQuantity(
                                Math.min(
                                  upgraderTargetMaxQuantity,
                                  Math.max(1, Math.floor(quantity)),
                                ),
                              );
                            }
                          }}
                          type="number"
                          value={upgraderTargetQuantity}
                        />
                        <button
                          aria-label="Agregar una unidad"
                          disabled={
                            upgraderPlaying ||
                            upgraderTargetQuantity >= upgraderTargetMaxQuantity
                          }
                          onClick={() =>
                            setUpgraderTargetQuantity((current) =>
                              Math.min(upgraderTargetMaxQuantity, current + 1),
                            )
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <em>Máximo disponible: {upgraderTargetMaxQuantity}</em>
                    </div>
                  </div>
                ) : (
                  <div className="upgrader-selection-empty" aria-hidden>
                    <Sparkles size={28} />
                    <span>El premio aparecerá acá</span>
                  </div>
                )}
              </div>
              <div className="upgrader-target-tools">
                <div className="stock-type-tabs" aria-label="Filtrar objetivos por juego">
                  <button
                    className={upgraderGame === "mixed" ? "active" : ""}
                    onClick={() => setUpgraderGame("mixed")}
                    type="button"
                  >
                    Todos
                  </button>
                  {cardGames.map((game) => (
                    <button
                      className={upgraderGame === game ? "active" : ""}
                      key={game}
                      onClick={() => setUpgraderGame(game)}
                      type="button"
                    >
                      {gameLabels[game]}
                    </button>
                  ))}
                </div>
                <label className="upgrader-search">
                  <Search size={17} aria-hidden />
                  <input
                    onChange={(event) => setUpgraderQuery(event.target.value)}
                    placeholder="Buscar premio"
                    value={upgraderQuery}
                  />
                </label>
                <div className="upgrader-price-filters">
                  <label>
                    <span>Precio mínimo</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => {
                        setUpgraderPreset(null);
                        setUpgraderTargetId(null);
                        setUpgraderMinPrice(event.target.value);
                      }}
                      placeholder="0"
                      step="0.01"
                      type="number"
                      value={upgraderMinPrice}
                    />
                  </label>
                  <label>
                    <span>Precio máximo</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => {
                        setUpgraderPreset(null);
                        setUpgraderTargetId(null);
                        setUpgraderMaxPrice(event.target.value);
                      }}
                      placeholder="Sin límite"
                      step="0.01"
                      type="number"
                      value={upgraderMaxPrice}
                    />
                  </label>
                </div>
              </div>
              <div className="upgrader-item-list">
                {upgraderLoading ? (
                  <div className="upgrader-empty" role="status">
                    <span className="mini-spinner" aria-hidden />
                    <strong>Cargando premios</strong>
                  </div>
                ) : filteredUpgraderTargets.length ? (
                  filteredUpgraderTargets.map((item) => {
                    const selected = item.id === upgraderTargetId;
                    return (
                      <button
                        aria-pressed={selected}
                        className={`upgrader-item${selected ? " selected" : ""}`}
                        disabled={upgraderPlaying}
                        key={item.id}
                        onClick={() => {
                          setUpgraderOutcome(null);
                          setUpgraderTargetId(item.id);
                        }}
                        type="button"
                      >
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span>
                          <strong>{item.card.name}</strong>
                          <small>{item.card.setName}</small>
                        </span>
                        <b>{formatUsd.format(item.card.priceUsd ?? 0)}</b>
                        <CircleCheck size={19} aria-hidden />
                      </button>
                    );
                  })
                ) : (
                  <div className="upgrader-empty">
                    <Search size={27} aria-hidden />
                    <strong>No hay objetivos para ese filtro</strong>
                    <p>Elegí una apuesta menor o cambiá la búsqueda.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {upgraderOutcome && (
            <article
              className={`upgrader-outcome ${upgraderOutcome.won ? "won" : "lost"}`}
              role="status"
            >
              {upgraderOutcome.target?.card && (
                <img
                  src={cardImage(upgraderOutcome.target.card)}
                  alt=""
                  onError={handleImageError(upgraderOutcome.target.card.game)}
                />
              )}
              <div>
                <span>{upgraderOutcome.won ? "Upgrade conseguido" : "No salió"}</span>
                <h2>
                  {upgraderOutcome.won
                    ? `${upgraderOutcome.targetQuantity && upgraderOutcome.targetQuantity > 1 ? `${upgraderOutcome.targetQuantity} × ` : ""}${upgraderOutcome.target?.card.name ?? "Premio"}`
                    : "La rueda quedó fuera de la zona ganadora"}
                </h2>
                <p>
                  Probabilidad {formatPercent.format(upgraderOutcome.chance ?? 0)}%
                  {upgraderOutcome.won
                    ? " · El premio ya está en tu inventario."
                    : " · Podés volver a intentarlo con otros premios."}
                </p>
              </div>
              {upgraderOutcome.won && (
                <Link className="secondary-action compact" href="/profile">
                  <Trophy size={17} aria-hidden />
                  Ver inventario
                </Link>
              )}
            </article>
          )}
      </>
    </section>
  );

  const changerSection = (
    <section className="upgrader-page changer-page page-section" aria-labelledby="changer-title">
      <div className="upgrader-heading">
        <span className="eyebrow">Changer</span>
        <h1 id="changer-title">Cambiá tus premios sin riesgo</h1>
        <p>
          Entregá premios de tu inventario y elegí productos por el mismo valor
          o menos. La diferencia vuelve automáticamente a tu cartera.
        </p>
      </div>

      {!session && (
        <div className="upgrader-guest-notice">
          <div>
            <span className="eyebrow">Modo demostración</span>
            <strong>Iniciá sesión para usar tus premios</strong>
            <p>Podés explorar los productos disponibles antes de entrar.</p>
          </div>
          <button
            className="primary-action compact"
            onClick={() => {
              setAuthMode("login");
              setHomeAuthOpen(true);
            }}
            type="button"
          >
            <LogIn size={17} aria-hidden />
            Entrar
          </button>
        </div>
      )}

      {changerOutcome && (
        <article className="upgrader-outcome won changer-outcome" role="status">
          <div className="changer-outcome-images" aria-hidden>
            {(changerOutcome.targets ?? []).slice(0, 4).map((target) => (
              <img
                src={cardImage(target.card)}
                alt=""
                key={target.stockId}
                onError={handleImageError(target.card.game)}
              />
            ))}
          </div>
          <div>
            <span>Cambio completado</span>
            <h2>{changerOutcome.awardedUserCardIds?.length ?? 0} premios agregados</h2>
            <p>
              Recibiste productos por {formatUsd.format(changerOutcome.targetValueUsd ?? 0)}.
              {(changerOutcome.refundUsd ?? 0) > 0 &&
                ` ${formatUsd.format(changerOutcome.refundUsd ?? 0)} volvieron a tu cartera.`}
            </p>
          </div>
          <Link className="secondary-action compact" href="/profile">
            <Trophy size={17} aria-hidden />
            Ver inventario
          </Link>
        </article>
      )}

      <div className="changer-layout">
        <section className="upgrader-panel changer-panel">
          <div className="upgrader-panel-heading">
            <div>
              <span>Entregás</span>
              <strong>{formatUsd.format(changerStakeValue)}</strong>
            </div>
            <small>{changerStakeCards.length}/20 elegidos</small>
          </div>
          <div className={`upgrader-selection-card selection-tray${changerStakeCards.length ? " filled" : ""}`}>
            <div className="upgrader-selection-copy">
              <small>Tus premios</small>
              <strong>{changerStakeCards.length ? `${changerStakeCards.length} seleccionados` : "Elegí qué querés cambiar"}</strong>
              <span>{changerStakeCards.length ? formatUsd.format(changerStakeValue) : "Tu selección aparecerá acá"}</span>
            </div>
            {changerStakeCards.length ? (
              <div className="upgrader-selection-strip">
                {changerStakeCards.map((item) => (
                  <button
                    aria-label={`Quitar ${item.card.name}`}
                    className="upgrader-selection-thumb"
                    disabled={changerSaving}
                    key={item.id}
                    onClick={() => toggleChangerStake(item.id)}
                    type="button"
                  >
                    <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
                    <span aria-hidden><X size={13} /></span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="upgrader-selection-empty" aria-hidden>
                <Trophy size={28} />
                <span>Tus premios aparecerán acá</span>
              </div>
            )}
          </div>
          <div className="upgrader-item-list">
            {ownedWonCards.length ? ownedWonCards.map((item) => {
              const selected = changerStakeIds.includes(item.id);
              return (
                <button
                  aria-pressed={selected}
                  className={`upgrader-item${selected ? " selected" : ""}`}
                  disabled={!session || changerSaving}
                  key={item.id}
                  onClick={() => toggleChangerStake(item.id)}
                  type="button"
                >
                  <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
                  <span><strong>{item.card.name}</strong><small>{item.card.setName}</small></span>
                  <b>{formatUsd.format(item.valueUsd)}</b>
                  <CircleCheck size={19} aria-hidden />
                </button>
              );
            }) : (
              <div className="upgrader-empty">
                <Trophy size={28} aria-hidden />
                <strong>{session ? "No tenés premios activos" : "Tu inventario aparecerá acá"}</strong>
                <p>{session ? "Abrí una caja para conseguir premios." : "Iniciá sesión para elegir tus premios."}</p>
              </div>
            )}
          </div>
        </section>

        <section className="upgrader-center changer-center" aria-label="Resumen del cambio">
          <div className="changer-symbol" aria-hidden>
            <ArrowRight size={42} />
          </div>
          <span className="eyebrow">Valor disponible</span>
          <strong className="changer-main-value">{formatUsd.format(changerStakeValue)}</strong>
          <div className="upgrader-values">
            <div><small>Entregás</small><strong>{formatUsd.format(changerStakeValue)}</strong></div>
            <ArrowRight size={20} aria-hidden />
            <div><small>Recibís</small><strong>{formatUsd.format(changerTargetValue)}</strong></div>
          </div>
          <div className={`changer-refund${changerTargetValue > changerStakeValue ? " invalid" : ""}`}>
            <Wallet size={22} aria-hidden />
            <div>
              <small>Vuelve a tu cartera</small>
              <strong>
                {changerTargetValue > changerStakeValue
                  ? `Faltan ${formatUsd.format(changerTargetValue - changerStakeValue)}`
                  : formatUsd.format(changerRefund)}
              </strong>
            </div>
          </div>
          <button
            className="primary-action changer-play"
            disabled={
              !session || changerSaving || !changerStakeIds.length ||
              !changerSelectedTargets.length || changerTargetValue <= 0 ||
              changerTargetValue > changerStakeValue
            }
            onClick={() => void playChanger()}
            type="button"
          >
            <ArrowUpDown size={19} aria-hidden />
            {changerSaving ? "Cambiando..." : "Confirmar cambio"}
          </button>
          <p className="upgrader-risk">El cambio es inmediato y no usa probabilidades.</p>
        </section>

        <section className="upgrader-panel changer-panel">
          <div className="upgrader-panel-heading">
            <div>
              <span>Recibís</span>
              <strong>{formatUsd.format(changerTargetValue)}</strong>
            </div>
            <small>{changerTargetUnits}/20 elegidos</small>
          </div>
          <div className={`upgrader-selection-card selection-tray${changerTargetUnits ? " filled" : ""}`}>
            <div className="upgrader-selection-copy">
              <small>Productos elegidos</small>
              <strong>{changerTargetUnits ? `${changerTargetUnits} productos` : "Elegí qué querés recibir"}</strong>
              <span>{changerTargetUnits ? formatUsd.format(changerTargetValue) : "Tu selección aparecerá acá"}</span>
            </div>
            {changerTargetUnits ? (
              <div className="upgrader-selection-strip">
                {changerSelectedTargets.flatMap(({ item, quantity }) =>
                  Array.from({ length: quantity }, (_, index) => (
                    <button
                      aria-label={`Quitar una unidad de ${item.card.name}`}
                      className="upgrader-selection-thumb"
                      disabled={changerSaving}
                      key={`${item.id}-${index}`}
                      onClick={() => removeChangerTarget(item.id)}
                      type="button"
                    >
                      <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
                      <span aria-hidden><X size={13} /></span>
                    </button>
                  )),
                )}
              </div>
            ) : (
              <div className="upgrader-selection-empty" aria-hidden>
                <Sparkles size={28} />
                <span>Los productos aparecerán acá</span>
              </div>
            )}
          </div>
          <div className="upgrader-target-tools">
            <div className="stock-type-tabs" aria-label="Filtrar por juego">
              <button className={changerGame === "mixed" ? "active" : ""} onClick={() => setChangerGame("mixed")} type="button">Todos</button>
              {cardGames.map((game) => (
                <button className={changerGame === game ? "active" : ""} key={game} onClick={() => setChangerGame(game)} type="button">{gameLabels[game]}</button>
              ))}
            </div>
            <label className="upgrader-search">
              <Search size={17} aria-hidden />
              <input onChange={(event) => setChangerQuery(event.target.value)} placeholder="Buscar producto" value={changerQuery} />
            </label>
          </div>
          <div className="upgrader-item-list">
            {changerLoading ? (
              <div className="upgrader-empty"><span className="mini-spinner" aria-hidden /><strong>Cargando productos</strong></div>
            ) : filteredChangerTargets.length ? filteredChangerTargets.map((item) => {
              const quantity = changerTargetQuantities[item.id] ?? 0;
              const price = Number(item.card.priceUsd ?? 0);
              const canAdd = Boolean(
                session && changerStakeIds.length && !changerSaving &&
                quantity < Math.min(20, item.quantity) && changerTargetUnits < 20 &&
                changerTargetValue + price <= changerStakeValue + 0.0001,
              );
              return (
                <button
                  aria-label={`Agregar ${item.card.name}`}
                  className={`upgrader-item${quantity ? " selected" : ""}`}
                  disabled={!canAdd}
                  key={item.id}
                  onClick={() => addChangerTarget(item)}
                  type="button"
                >
                  <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
                  <span><strong>{item.card.name}</strong><small>{item.card.setName} · stock {item.quantity}</small></span>
                  <b>{quantity ? `${quantity}× · ` : ""}{formatUsd.format(price)}</b>
                  <Plus size={19} aria-hidden />
                </button>
              );
            }) : (
              <div className="upgrader-empty"><Search size={27} aria-hidden /><strong>No hay productos para ese filtro</strong></div>
            )}
          </div>
        </section>
      </div>
    </section>
  );

  const inventoryPanel = (
    <section className="inventory-panel" aria-label="Inventario de premios">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Inventario</span>
          <h2>Tus premios</h2>
        </div>
        <button
          className="secondary-action compact"
          onClick={() => void loadWonCards()}
          type="button"
        >
          <RotateCcw size={16} aria-hidden />
          Refrescar
        </button>
      </div>
      <div className="shipment-view-tabs profile-prize-tabs">
        <button
          className={profilePrizeView === "inventory" ? "active" : ""}
          onClick={() => setProfilePrizeView("inventory")}
          type="button"
        >
          <Boxes size={16} aria-hidden />
          Inventario
        </button>
        <button
          className={profilePrizeView === "shipments" ? "active" : ""}
          onClick={() => setProfilePrizeView("shipments")}
          type="button"
        >
          <Truck size={16} aria-hidden />
          Retiros y envios
        </button>
      </div>
      {!session?.hasShippingAddress && (
        <div className="profile-address-alert" role="status">
          <TriangleAlert size={20} aria-hidden />
          <span>
            <strong>Completa tu domicilio para retirar premios</strong>
            <small>
              Falta: {(
                session?.shippingAddressMissing ?? ["datos obligatorios"]
              ).join(", ")}.
            </small>
          </span>
          <button
            className="secondary-action compact"
            onClick={() => setProfileSectionView("personal")}
            type="button"
          >
            Completar datos
          </button>
        </div>
      )}
      {profilePrizeView === "inventory" ? (
        <>
          <div className="profile-inventory-value">
            <small>Valor disponible</small>
            <strong>{formatUsd.format(ownedWonCardsValue)}</strong>
          </div>
          <div className="inventory-toolbar">
            <label className="switch-control">
              <input
                checked={inventoryActiveOnly}
                onChange={(event) => setInventoryActiveOnly(event.target.checked)}
                role="switch"
                type="checkbox"
              />
              <span className="switch-track" aria-hidden>
                <span />
              </span>
              <span>Solo activos</span>
            </label>
            <SortControl
              ariaLabel="Ordenar inventario por precio"
              onChange={(value) =>
                setInventoryPriceSort(value as "price-desc" | "price-asc")
              }
              options={[
                { value: "price-desc", label: "Mayor a menor" },
                { value: "price-asc", label: "Menor a mayor" },
              ]}
              value={inventoryPriceSort}
            />
          </div>
          <div className="inventory-list">
            {visibleInventoryCards.length ? (
              visibleInventoryCards.map((cardItem) => (
                <article
                  className={`inventory-card ${itemTypeOf(cardItem.card)}`}
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
                      <span className={`status-chip ${cardItem.status}`}>
                        {cardStatusLabels[cardItem.status]}
                      </span>
                      <span className={`prize-type-chip ${itemTypeOf(cardItem.card)}`}>
                        {prizeTypeLabels[itemTypeOf(cardItem.card)]}
                      </span>
                    </div>
                    <strong>{cardItem.card.name}</strong>
                    <small>
                      {cardItem.packName} - {formatUsd.format(cardItem.valueUsd)}
                    </small>
                    <small>
                      {cardItem.card.setName}
                      {cardItem.card.number ? ` #${cardItem.card.number}` : ""}
                    </small>
                    <small>Ganada: {formatCardDate(cardItem.acquiredAt)}</small>
                  </div>
                  {(cardItem.status === "owned" ||
                    cardItem.status === "waiting_stock") && (
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
                  )}
                </article>
              ))
            ) : (
              <p className="empty-list">
                {inventoryActiveOnly
                  ? "No tenes premios activos para vender o retirar."
                  : "No hay premios en tu inventario."}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="shipment-group-list profile-shipment-list">
          {userWithdrawalGroups.map((group) => (
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
                        : "Preparando envio"}
                  </span>
                  <strong>
                    {group.items.length === 1
                      ? "1 premio en este paquete"
                      : `${group.items.length} premios en este paquete`}
                  </strong>
                </div>
                <div className="tracking-summary">
                  <small>Numero de seguimiento</small>
                  <strong>{group.trackingNumber || "Pendiente de asignar"}</strong>
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
          {!userWithdrawalGroups.length && (
            <p className="empty-list">Todavia no tenes retiros confirmados.</p>
          )}
        </div>
      )}
    </section>
  );

  const profileSection = (
    <section className="admin-band page-section" aria-label="Perfil de usuario">
      <div className="admin-intro">
        <span className="eyebrow">Perfil</span>
        <h1>Cuenta local</h1>
        <p>Modifica los datos del usuario que esta usando Pullario en esta PC.</p>
      </div>

      {session ? (
        <>
          <nav className="profile-section-nav" aria-label="Secciones del perfil">
            <button
              className={profileSectionView === "personal" ? "active" : ""}
              onClick={() => setProfileSectionView("personal")}
              type="button"
            >
              <User size={17} aria-hidden />
              Datos personales
            </button>
            <button
              className={profileSectionView === "inventory" ? "active" : ""}
              onClick={() => setProfileSectionView("inventory")}
              type="button"
            >
              <Boxes size={17} aria-hidden />
              Inventario
            </button>
          </nav>

          {profileSectionView === "personal" ? (
            <div className="profile-personal-layout">
              <aside className="profile-account-summary">
                <span className="db-status online">
                  <User size={16} aria-hidden />
                  {roleLabels[session.role]}
                </span>
                <strong>{session.username}</strong>
                <small>
                  Balance demo {formatUsd.format(session.balanceUsd ?? 0)}
                </small>
                <div
                  className={`address-status ${
                    session.hasShippingAddress ? "complete" : "incomplete"
                  }`}
                >
                  {session.hasShippingAddress ? (
                    <CircleCheck size={18} aria-hidden />
                  ) : (
                    <TriangleAlert size={18} aria-hidden />
                  )}
                  <span>
                    <strong>
                      {session.hasShippingAddress
                        ? "Domicilio completo"
                        : "Falta completar el domicilio"}
                    </strong>
                    <small>
                      {session.hasShippingAddress
                        ? "Ya podes solicitar retiros fisicos."
                        : `Falta: ${(
                            session.shippingAddressMissing ?? ["datos obligatorios"]
                          ).join(", ")}.`}
                    </small>
                  </span>
                </div>
              </aside>

              <form
                className="profile-details-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void updateProfile();
                }}
              >
                <section className="profile-form-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Cuenta y contacto</span>
                    <h2>Informacion personal</h2>
                  </div>
                  <div className="profile-form-grid">
                    <label>
                      Nombre visible
                      <input
                        onChange={(event) =>
                          setProfileDisplayName(event.target.value)
                        }
                        value={profileDisplayName}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Nombre y apellido
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="name"
                        onChange={(event) => setProfileFullName(event.target.value)}
                        placeholder="Nombre del destinatario"
                        required
                        value={profileFullName}
                      />
                    </label>
                    <label>
                      Email
                      <input
                        autoComplete="email"
                        onChange={(event) => setProfileEmail(event.target.value)}
                        type="email"
                        value={profileEmail}
                      />
                    </label>
                    <label>
                      Telefono
                      <input
                        autoComplete="tel"
                        onChange={(event) => setProfilePhone(event.target.value)}
                        placeholder="Ej: +54 11 5555 5555"
                        type="tel"
                        value={profilePhone}
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-form-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Entrega</span>
                    <h2>Domicilio</h2>
                    <p>Usaremos esta direccion para enviar tus premios retirados.</p>
                    <div className="shipping-country-notice">
                      <Info size={17} aria-hidden />
                      Por el momento realizamos envios unicamente dentro de Argentina.
                    </div>
                  </div>
                  <div className="profile-form-grid address-grid">
                    <label>
                      <span className="field-label">
                        Pais
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <select
                        autoComplete="country-name"
                        onChange={(event) => setProfileCountry(event.target.value)}
                        required
                        value={profileCountry}
                      >
                        <option value="Argentina">Argentina</option>
                        <option disabled value="proximamente">
                          Otros paises proximamente
                        </option>
                      </select>
                    </label>
                    <label>
                      <span className="field-label">
                        Provincia
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <select
                        autoComplete="address-level1"
                        onChange={(event) =>
                          setProfileProvince(event.target.value)
                        }
                        required
                        value={profileProvince}
                      >
                        <option value="">Seleccionar provincia</option>
                        {argentinaProvinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="field-label">
                        Ciudad
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="address-level2"
                        onChange={(event) => setProfileCity(event.target.value)}
                        required
                        value={profileCity}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Calle
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="address-line1"
                        onChange={(event) => setProfileStreet(event.target.value)}
                        placeholder="Ej: Av. Corrientes"
                        required
                        value={profileStreet}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Numero
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        onChange={(event) =>
                          setProfileStreetNumber(event.target.value)
                        }
                        placeholder="Ej: 1234"
                        required
                        value={profileStreetNumber}
                      />
                    </label>
                    <label>
                      Piso
                      <input
                        onChange={(event) => setProfileFloor(event.target.value)}
                        placeholder="Ej: 4"
                        value={profileFloor}
                      />
                    </label>
                    <label>
                      Departamento
                      <input
                        onChange={(event) =>
                          setProfileApartment(event.target.value)
                        }
                        placeholder="Ej: B"
                        value={profileApartment}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Codigo postal
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="postal-code"
                        onChange={(event) =>
                          setProfilePostalCode(event.target.value)
                        }
                        required
                        value={profilePostalCode}
                      />
                    </label>
                    <label className="wide-field">
                      Referencia
                      <input
                        onChange={(event) =>
                          setProfileAddressReference(event.target.value)
                        }
                        placeholder="Ej: Porton negro, timbre 2"
                        value={profileAddressReference}
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-form-section security-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Seguridad</span>
                    <h2>Cambiar contraseña</h2>
                  </div>
                  <label>
                    Nueva contraseña
                    <input
                      autoComplete="new-password"
                      onChange={(event) => setProfilePassword(event.target.value)}
                      placeholder="Dejar vacio para no cambiar"
                      type="password"
                      value={profilePassword}
                    />
                  </label>
                </section>

                <div className="profile-form-actions">
                  {profileMessage && (
                    <p className="admin-message">{profileMessage}</p>
                  )}
                  <button
                    className="primary-action compact"
                    disabled={profileSaving}
                    type="submit"
                  >
                    <Save size={17} aria-hidden />
                    {profileSaving ? "Guardando" : "Guardar datos"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="profile-inventory-view">{inventoryPanel}</div>
          )}
        </>
      ) : (
        <div className="login-panel">
          <span className="eyebrow">Sesion requerida</span>
          <h3>Entrar desde la pagina principal</h3>
          <Link className="primary-action compact" href="/">
            <LogIn size={17} aria-hidden />
            Ir al login
          </Link>
        </div>
      )}
    </section>
  );

  const pageTransitionKey = [view, initialPackId ?? ""].join(":");

  return (
    <MarketContext.Provider value={market}>
    <main className="market-shell design-v3">
      <header className="app-header">
        <Link className="brand-link" href="/">
          <PackageOpen size={20} aria-hidden />
          Pullario
        </Link>
        <nav className="app-nav" aria-label="Navegacion principal">
          <div className="nav-cluster nav-pages">
            <Link className={view === "home" ? "active" : ""} href="/">
              <Home size={16} aria-hidden />
              Cajas
            </Link>
            <Link
              className={view === "upgrader" ? "active" : ""}
              href="/upgrader"
            >
              <ArrowUpDown size={16} aria-hidden />
              Upgrader
            </Link>
            <Link
              className={view === "changer" ? "active" : ""}
              href="/changer"
            >
              <ArrowRight size={16} aria-hidden />
              Changer
            </Link>
            <Link className={view === "cards" ? "active" : ""} href="/cards">
              <Search size={16} aria-hidden />
              Cartas
            </Link>
            <Link href="/#como-funciona">
              <Info size={16} aria-hidden />
              Guia
            </Link>
            <Link href="/#confianza">
              <ShieldCheck size={16} aria-hidden />
              Confianza
            </Link>
          </div>
          {session && (
            <div className="nav-cluster nav-session">
              <button
                className="nav-value nav-value-wins"
                onClick={() => {
                  setWonCardsOpen(true);
                  void loadWonCards();
                }}
                type="button"
              >
                <Trophy size={17} aria-hidden />
                <span>
                  <strong>{formatUsd.format(ownedWonCardsValue)}</strong>
                  <small>Premios ganados</small>
                </span>
              </button>
              <button
                className="nav-value nav-value-wallet"
                onClick={() => setWalletOpen(true)}
                type="button"
              >
                <Wallet size={17} aria-hidden />
                <span>
                  <strong>{formatUsd.format(session.balanceUsd ?? 0)}</strong>
                  <small>Cartera</small>
                </span>
              </button>
              <Link
                className={`nav-user ${view === "profile" ? "active" : ""}`}
                href="/profile"
              >
                <User size={16} aria-hidden />
                <span>{session.displayName || session.username}</span>
              </Link>
            </div>
          )}
          {!session && (
            <div className="nav-cluster nav-auth">
              <button
                className="nav-login-button"
                onClick={() => {
                  setAuthMode("login");
                  setHomeAuthOpen(true);
                }}
                type="button"
              >
                <LogIn size={16} aria-hidden />
                Entrar
              </button>
            </div>
          )}
          {(isSellerRole(session?.role) || session) && (
            <div className="nav-cluster nav-tools">
              {isSellerRole(session?.role) && (
                <Link
                  className={view.startsWith("admin") ? "active" : ""}
                  href="/admin"
                >
                  <Settings size={16} aria-hidden />
                  Admin
                </Link>
              )}
              {session && (
                <button
                  aria-label="Cerrar sesion"
                  className="nav-icon-button"
                  onClick={logout}
                  type="button"
                >
                  <LockKeyhole size={16} aria-hidden />
                  <span>Salir</span>
                </button>
              )}
            </div>
          )}
        </nav>
      </header>

      <div
        className={`page-transition ${
          view === "cards" ? "cards-page-transition" : ""
        }`}
        key={pageTransitionKey}
      >
        {view === "home" && (
          <>
            <section className="market-hero" aria-labelledby="main-title">
              <div className="hero-product-stage" aria-hidden>
                {heroShowcaseItems.map((item, index) => (
                  <img
                    className={`hero-product hero-product-${index + 1}`}
                    key={`hero-${item.slotId}`}
                    src={cardImage(item.card)}
                    alt=""
                    onError={handleImageError(item.card.game, itemTypeOf(item.card))}
                  />
                ))}
              </div>
              <div className="hero-copy">
                <div className="status-pill">
                  <Sparkles size={16} aria-hidden />
                  One Piece · Pokemon · Magic
                </div>
                <h1 id="main-title">Cajas TCG para coleccionistas</h1>
                <p>
                  Premios reales, probabilidades visibles y una apertura que
                  termina en tu inventario.
                </p>
                <div className="hero-actions" aria-label="Acciones principales">
                  <Link className="primary-action" href="#cajas">
                    <PackageOpen size={18} aria-hidden />
                    Ver cajas
                  </Link>
                  <Link className="secondary-action" href="/cards">
                    <Search size={18} aria-hidden />
                    Buscar cartas
                  </Link>
                </div>
              </div>
            </section>

            {!session && (
              <section className="home-access-band" aria-label="Acceso a Pullario">
                <div>
                  <span className="eyebrow">Tu cuenta</span>
                  <h2>Entra para abrir, guardar y retirar premios.</h2>
                </div>
                <div className="home-access-actions">
                  <button
                    className="secondary-action compact"
                    onClick={() => {
                      setAuthMode("login");
                      setHomeAuthOpen(true);
                    }}
                    type="button"
                  >
                    <LogIn size={17} aria-hidden />
                    Entrar
                  </button>
                  <button
                    className="primary-action compact"
                    onClick={() => {
                      setAuthMode("register");
                      setHomeAuthOpen(true);
                    }}
                    type="button"
                  >
                    <UserPlus size={17} aria-hidden />
                    Crear cuenta
                  </button>
                </div>
              </section>
            )}

            {packListing}
            {homeGuideSection}

            <section
              className="trust-band"
              id="confianza"
              aria-label="Controles de confianza"
            >
              <article>
                <Eye size={22} aria-hidden />
                <h3>Todo visible</h3>
                <p>
                  Revisa los premios y sus probabilidades antes de abrir.
                </p>
              </article>
              <article>
                <Dice5 size={22} aria-hidden />
                <h3>Resultado claro</h3>
                <p>
                  La ruleta termina sobre el mismo premio que recibes.
                </p>
              </article>
              <article>
                <Trophy size={22} aria-hidden />
                <h3>Tu premio, tu decision</h3>
                <p>
                  Guardalo, vendelo por saldo o solicita el retiro fisico.
                </p>
              </article>
            </section>
          </>
        )}

        {view === "pack" &&
          (selectedPackExists ? (
            <>
              {openingSection}
              {contentsSection}
            </>
          ) : (
            missingPackSection
          ))}
        {view === "cards" && searchSection}
        {view === "upgrader" && upgraderSection}
        {view === "changer" && changerSection}
        {view.startsWith("admin") && adminSection}
        {view === "profile" && profileSection}
        {siteFooter}
      </div>

      {homeAuthOpen && !session && (
        <div
          className="modal-backdrop"
          onKeyDown={(event) => {
            if (event.key === "Escape") setHomeAuthOpen(false);
          }}
          role="presentation"
        >
          <article
            aria-label="Acceso a Pullario"
            aria-modal="true"
            className="utility-modal home-auth-modal"
            role="dialog"
          >
            <button
              aria-label="Cerrar acceso"
              className="modal-close"
              onClick={() => setHomeAuthOpen(false)}
              type="button"
            >
              <X size={18} aria-hidden />
            </button>
            {authPanel}
          </article>
        </div>
      )}

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

      {walletOpen && (
        <div
          className="modal-backdrop"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setWalletOpen(false);
            }
          }}
          role="presentation"
        >
          <article
            aria-labelledby="wallet-modal-title"
            aria-modal="true"
            className="utility-modal"
            role="dialog"
          >
            <button
              aria-label="Cerrar cartera"
              className="modal-close"
              onClick={() => setWalletOpen(false)}
              type="button"
            >
              <X size={18} aria-hidden />
            </button>
            <span className="eyebrow">Cartera</span>
            <h2 id="wallet-modal-title">
              {formatUsd.format(session?.balanceUsd ?? 0)}
            </h2>
            <p>
              Recarga saldo demo local para probar aperturas y compras sin pagos
              reales.
            </p>
            <label>
              Monto USD
              <input
                inputMode="decimal"
                onChange={(event) => setWalletAmount(event.target.value)}
                placeholder="Ej: 10"
                type="text"
                value={walletAmount}
              />
            </label>
            <button
              className="primary-action compact"
              disabled={
                walletSaving ||
                !Number.isFinite(Number(walletAmount)) ||
                Number(walletAmount) <= 0
              }
              onClick={() => void topUpWallet()}
              type="button"
            >
              <Wallet size={17} aria-hidden />
              {walletSaving ? "Recargando" : "Recargar dinero"}
            </button>
            {walletMessage && <p className="admin-message">{walletMessage}</p>}
          </article>
        </div>
      )}

      {wonCardsOpen && (
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
      )}

      {wonCardsMessage && (
        <div
          aria-live="polite"
          className={`notice-toast ${wonCardsMessageTone}`}
          role={wonCardsMessageTone === "error" ? "alert" : "status"}
        >
          {wonCardsMessageTone === "success" ? (
            <CircleCheck size={20} aria-hidden />
          ) : wonCardsMessageTone === "warning" ? (
            <TriangleAlert size={20} aria-hidden />
          ) : wonCardsMessageTone === "error" ? (
            <CircleX size={20} aria-hidden />
          ) : (
            <Info size={20} aria-hidden />
          )}
          <span>{wonCardsMessage}</span>
          <button
            aria-label="Cerrar notificacion"
            onClick={() => setWonCardsMessage("")}
            type="button"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard.card}
          key={`${selectedCard.card.game}-${selectedCard.card.id}`}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </main>
    </MarketContext.Provider>
  );
}
