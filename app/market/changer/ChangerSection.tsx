/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  CircleCheck,
  LogIn,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Wallet,
  X,
} from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { cardGames, gameLabels } from "../catalog";
import { formatUsd } from "../format";
import { useMarket } from "../MarketContext";

export function ChangerSection() {
  const {
    addChangerTarget,
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
    filteredChangerTargets,
    ownedWonCards,
    playChanger,
    removeChangerTarget,
    session,
    setAuthMode,
    setChangerGame,
    setChangerQuery,
    setHomeAuthOpen,
    toggleChangerStake,
  } = useMarket();

  return (
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
}
