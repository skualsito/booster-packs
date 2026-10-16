/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ShippingModal } from "./market/admin/AdminOrdersSection";
import { AdminSection } from "./market/admin/AdminSection";
import { StockEditModal } from "./market/admin/StockEditModal";
import { AuthModal } from "./market/auth/AuthPanel";
import { cardImage, handleImageError } from "./market/card-display";
import {
  CardsSearchSection,
  SelectedCardModal,
} from "./market/cards/CardsSearchSection";
import { gameLabels, itemTypeOf, prizeTypeLabels } from "./market/catalog";
import { ChangerSection } from "./market/changer/ChangerSection";
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
  Dice5,
  Eye,
  Home,
  RotateCcw,
  Sparkles,
  Trophy,
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
    apiStatus,
    authMessage,
    celebratingRunId,
    idleRouletteItems,
    loadDbPacks,
    openingPack,
    openPack,
    recentDrops,
    recentDropsLoading,
    rouletteTrackRef,
    selectedPack,
    selectedPackExists,
    selectedTopItem,
    session,
    showCardDetails,
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
        {view.startsWith("admin") && <AdminSection />}
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
